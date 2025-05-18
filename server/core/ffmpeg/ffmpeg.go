package ffmpeg

import (
	"bufio"
	"bytes"
	"errors"
	"fmt"
	"io"
	"os/exec"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"
)

type ffmpegMode uint8

const (
	NULL ffmpegMode = iota
	STREAM
	FILE
)

type FFmpeg struct {
	inputOpt        []string
	outputOpt       []string
	finalArgs       []string
	originPath      string
	outputTemplate  string
	originStream    *io.PipeReader
	outputDir       string
	frameDataChan   chan FrameData
	cmd             *exec.Cmd
	log             *io.ReadCloser
	mode            ffmpegMode
	stampsLock      sync.RWMutex
	frameTimestamps []string
	clearGap        time.Duration
	keepFrames      int
}

type ArgsMap map[string]string

func (f *FFmpeg) AddInputMap(args ArgsMap) {
	for key, value := range args {
		f.AddInputOpt(key, value)
	}
}
func (f *FFmpeg) AddInputOpt(key string, value string) {
	if key != "" && value != "" {
		if strings.HasPrefix(key, "-") {
			f.inputOpt = append(f.inputOpt, key, value)
		} else {
			f.inputOpt = append(f.inputOpt, "-"+key, value)
		}
	}
}
func (f *FFmpeg) AddOutputMap(args ArgsMap) {
	for key, value := range args {
		f.AddOutputOpt(key, value)
	}
}
func (f *FFmpeg) AddOutputOpt(key string, value string) {
	if key != "" && value != "" {
		if strings.HasPrefix(key, "-") {
			f.outputOpt = append(f.outputOpt, key, value)
		} else {
			f.outputOpt = append(f.outputOpt, "-"+key, value)
		}
	}
}
func (f *FFmpeg) AddOutput(OutputDir, OutputTemplate string) {
	f.outputDir = OutputDir
	f.outputTemplate = OutputTemplate
}
func (f *FFmpeg) AddSource(originStream *io.PipeReader, originPath string) error {
	if originStream != nil {
		f.originStream = originStream
		f.mode = STREAM
	} else if originPath != "" {
		f.originPath = originPath
		f.mode = FILE
	} else {
		f.mode = NULL
		return errors.New("未指定输入源")
	}
	return nil
}
func (f *FFmpeg) Build() *FFmpeg {
	f.finalArgs = append(f.finalArgs, f.inputOpt...)
	if f.mode == STREAM {
		f.finalArgs = append(f.finalArgs, "-i", "pipe:0")
	} else {
		f.finalArgs = append(f.finalArgs, "-i", f.originPath)
	}
	f.finalArgs = append(f.finalArgs, f.outputOpt...)
	f.finalArgs = append(f.finalArgs, filepath.Join(f.outputDir, f.outputTemplate))
	f.cmd = exec.Command("ffmpeg", f.finalArgs...)
	errPipe, _ := f.cmd.StderrPipe()
	f.log = &errPipe
	if f.mode == STREAM {
		f.cmd.Stdin = f.originStream
	}
	return f
}
func (f *FFmpeg) Run() error {
	if f.cmd == nil {
		return errors.New("未构建命令")
	}
	if f.mode == NULL {
		return errors.New("未指定输入源")
	}
	if f.outputDir == "" || f.outputTemplate == "" {
		return errors.New("未指定输出路径或文件模式")
	}
	if f.frameTimestamps != nil {
		go f.timeStamp()
	}
	if f.clearGap != 0 && f.keepFrames != 0 {
		var stopChan = make(chan struct{}, 1)
		defer close(stopChan)
		go f.clearStamp(stopChan)
	}
	if err := f.cmd.Start(); err != nil {
		return fmt.Errorf("启动FFmpeg失败: %w", err)
	} else if err := f.cmd.Wait(); err != nil {
		return fmt.Errorf("抽帧出错: %w", err)
	}
	fmt.Println("抽帧结束！")
	return nil
}
func (f *FFmpeg) AddTimeStamp() *FFmpeg {
	f.frameTimestamps = make([]string, 100)
	return f
}
func (f *FFmpeg) timeStamp() {
	scanner := bufio.NewScanner(*f.log)
	//[Parsed_showinfo_1 @ 000002666e8d97c0] n:  12 pts:     12 pts_time:4       duration:      1 duration_time:0.333333 fmt:nv12 cl:left sar:1/1 s:1920x1080 i:P iskey:0 type:P checksum:7429297B plane_checksum:[5DAAB2C5 BBE676A7] mean:[163 128] stdev:[91.0 0.0]
	//n：帧序号
	//pts/pts_time：时间戳及对应时间
	//duration/duration_time：持续时长
	//fmt：像素格式
	//s：分辨率
	//i：帧类型（I/P/B）
	//iskey：是否为关键帧
	//checksum：校验值
	var frameIndex int64
	var frameRegex = regexp.MustCompile(`pts_time:([\d.]+)`)
	//logRegex := regexp.MustCompile(pattern)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.Contains(line, "pts_time") {
			// 基本时间戳提取
			matches := frameRegex.FindStringSubmatch(line)
			if len(matches) > 1 {
				timestamp := matches[1]
				fmt.Printf("Frame %d: PTS = %s秒\n", frameIndex, timestamp)
				f.stampsLock.Lock()
				f.frameTimestamps = append(f.frameTimestamps, timestamp)
				f.stampsLock.Unlock()
				if f.frameDataChan != nil {
					float, _ := strconv.ParseFloat(timestamp, 64)
					f.frameDataChan <- FrameData{
						Data:      nil,
						Timestamp: float,
						Index:     frameIndex,
					}
				}
				frameIndex++
			}

		}
	}
}
func (f *FFmpeg) AddClearStamp(gap time.Duration, keepFrames int) *FFmpeg {
	if gap <= 0 {
		//默认清理间隔5秒
		gap = 5 * time.Second
	}
	f.clearGap = gap
	if keepFrames <= 0 {
		//默认保留45帧
		keepFrames = 45
	}
	f.keepFrames = keepFrames
	return f
}
func (f *FFmpeg) clearStamp(stopChan chan struct{}) {
	ticker := time.Tick(f.clearGap)
	for {
		select {
		case <-stopChan:
			fmt.Println("clear end,clear all frames")
			files, _ := filepath.Glob(filepath.Join(f.outputDir, "*.jpg"))
			if err := rmfile(files); err != nil {
				fmt.Printf("clear file error: %v\n", err)
			}
			return
		case <-ticker:
			//TODO
			files, _ := filepath.Glob(filepath.Join(f.outputDir, "*.jpg"))
			if len(files) > f.keepFrames {
				var sub = len(files) - f.keepFrames
				if err := rmfile(files[:sub]); err != nil {
					fmt.Printf("clear file error: %v\n", err)
					return
				}
				fmt.Println(files)
			}
		}
	}
}

func (f *FFmpeg) BuildForStream() *FFmpeg {
	f.finalArgs = append(f.finalArgs, f.inputOpt...)
	if f.mode == STREAM {
		f.finalArgs = append(f.finalArgs, "-i", "pipe:0")
	} else {
		f.finalArgs = append(f.finalArgs, "-i", f.originPath)
	}
	f.finalArgs = append(f.finalArgs, f.outputOpt...)
	// 添加输出路径，使用"-"表示输出到标准输出
	f.finalArgs = append(f.finalArgs, "-")

	f.cmd = exec.Command("ffmpeg", f.finalArgs...)
	errPipe, _ := f.cmd.StderrPipe()
	f.log = &errPipe
	if f.mode == STREAM {
		f.cmd.Stdin = f.originStream
	}
	f.frameDataChan = make(chan FrameData, 100)
	return f
}
func (f *FFmpeg) RunForStream(frameChannel chan FrameData) error {
	defer close(frameChannel)
	if f.cmd == nil {
		return errors.New("未构建命令")
	}
	if f.mode == NULL {
		return errors.New("未指定输入源")
	}
	imgReader, imgWriter := io.Pipe()
	defer imgWriter.Close()
	f.cmd.Stdout = imgWriter
	if f.frameTimestamps != nil {
		go f.timeStamp()
	}
	go f.readIMG(imgReader, frameChannel)
	if err := f.cmd.Start(); err != nil {
		return fmt.Errorf("启动FFmpeg失败: %v\n", err)
	} else if err := f.cmd.Wait(); err != nil {
		return fmt.Errorf("抽帧出错: %v\n", err)
	}
	fmt.Println("抽帧结束！")
	return nil
}
func (f *FFmpeg) readIMG(imgReader *io.PipeReader, frameChannel chan FrameData) {
	buffer := make([]byte, 1024*1024)
	imgBuffer := bytes.NewBuffer(nil)
	var imgStart bool
	for {
		n, err := imgReader.Read(buffer)
		if err != nil {
			if err != io.EOF {
				fmt.Printf("读取图像数据错误: %v\n", err)
			}
			break
		}
		imgBuffer.Write(buffer[:n])
		// 假设输出图像格式为JPEG
		data := imgBuffer.Bytes()
		if len(data) > 2 && data[0] == 0xFF && data[1] == 0xD8 {
			imgStart = true
		}
		// 检查图像结束标记
		if imgStart && len(data) > 2 {
			for i := 0; i < len(data)-1; i++ {
				if data[i] == 0xFF && data[i+1] == 0xD9 {
					// 找到完整图像，从frameDataChan读取对应的时间戳信息
					// 简化处理，可能需要更精确的帧与时间戳匹配逻辑
					select {
					case frameData, ok := <-f.frameDataChan:
						if !ok {
							return // 通道已关闭
						}
						// 更新帧数据
						frameData.Data = make([]byte, imgBuffer.Len())
						copy(frameData.Data, imgBuffer.Bytes())
						frameChannel <- frameData
					default:
						// 没有对应的时间戳，使用空时间戳
						frameChannel <- FrameData{
							Data:      imgBuffer.Bytes(),
							Timestamp: 0,
							Index:     -1,
						}
					}
					// 重置图像缓冲区
					imgBuffer.Reset()
					imgStart = false
					break
				}
			}
		}
	}
}
