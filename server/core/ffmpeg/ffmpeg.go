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
	"server/utils"
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
	Name              string
	inputOpt          []string
	outputOpt         []string
	finalArgs         []string
	originPath        string
	outputTemplate    string
	originStream      *io.PipeReader
	outputDir         string
	frameDataChan     chan *FrameData
	frameDataTemp     []*FrameData
	frameTempLock     sync.RWMutex
	frameTempClearing bool
	metaDataChan      chan *MetaData
	cmd               *exec.Cmd
	log               *io.ReadCloser
	mode              ffmpegMode
	stampsLock        sync.RWMutex
	frameTimestamps   []string
	clearGap          time.Duration
	keepFrames        int
	closeChan         chan struct{}
	closeChanLock     sync.Once
	imgReader         *io.PipeReader
	imgWriter         *io.PipeWriter
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
	f.closeChan = make(chan struct{})
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
		go f.clearStamp()
	}
	if err := f.cmd.Start(); err != nil {
		return fmt.Errorf("启动FFmpeg失败: %w", err)
	} else if err := f.cmd.Wait(); err != nil {
		return fmt.Errorf("抽帧出错: %w", err)
	}
	f.Close()
	utils.Logger("FFmpeg").Printf("FFmpeg(%s)抽帧结束！", f.Name)
	return nil
}
func (f *FFmpeg) AddTimeStamp() *FFmpeg {
	f.frameTimestamps = make([]string, 100)
	return f
}
func (f *FFmpeg) timeStamp() {
	defer func() {
		if err := recover(); err != nil {
			utils.Logger("FFmpeg").Printf("FFmpeg(%s) readIMG Err: %v", f.Name, err)
		}
		fmt.Println("timeStamp close")
	}()
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
		select {
		case <-f.closeChan:
			fmt.Println("timeStamp get close sign")
			return
		default:
			line := scanner.Text()
			if strings.Contains(line, "pts_time") {
				// 基本时间戳提取
				matches := frameRegex.FindStringSubmatch(line)
				if len(matches) > 1 {
					timestamp := matches[1]
					//fmt.Printf("Original frame %d: PTS = %s秒\n", frameIndex, timestamp)
					f.stampsLock.Lock()
					f.frameTimestamps = append(f.frameTimestamps, timestamp)
					f.stampsLock.Unlock()
					float, _ := strconv.ParseFloat(timestamp, 64)
					if f.frameDataChan != nil {
						f.frameDataChan <- &FrameData{
							Data:      nil,
							Timestamp: float,
							Index:     frameIndex,
						}
					}
					if f.metaDataChan != nil {
						f.metaDataChan <- &MetaData{
							Timestamp: float,
							Index:     frameIndex,
						}
					}
					frameIndex++
				}
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
func (f *FFmpeg) clearStamp() {
	ticker := time.Tick(f.clearGap)
	for {
		select {
		case <-f.closeChan:
			fmt.Println("clear all frames")
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
	f.closeChan = make(chan struct{})
	f.frameDataTemp = make([]*FrameData, 0, 1000)
	return f
}
func (f *FFmpeg) RunForStream(frameChannel chan *FrameData, metaChannel chan *MetaData) error {
	if f.cmd == nil {
		return errors.New("未构建命令")
	}
	if f.mode == NULL {
		return errors.New("未指定输入源")
	}
	f.imgReader, f.imgWriter = io.Pipe()
	f.cmd.Stdout = f.imgWriter
	f.metaDataChan = metaChannel
	defer close(frameChannel)
	defer close(metaChannel)
	defer f.Close()
	defer f.imgWriter.Close()
	if f.frameTimestamps != nil {
		go f.timeStamp()
	}
	if frameChannel != nil {
		f.frameDataChan = make(chan *FrameData, 100)
		go f.readIMG(frameChannel)
	}
	if err := f.cmd.Start(); err != nil {
		return fmt.Errorf("启动FFmpeg(%s)失败: %v\n", f.Name, err)
	} else if err := f.cmd.Wait(); err != nil {
		return fmt.Errorf("FFmpeg(%s)抽帧出错: %v\n", f.Name, err)
	}
	utils.Logger("FFmpeg").Printf("FFmpeg(%s)抽帧结束！", f.Name)
	return nil
}

// JPEG开始和结束标记
const (
	SOI = 0xD8 // Start of Image marker (after 0xFF)
	EOI = 0xD9 // End of Image marker (after 0xFF)
)

func (f *FFmpeg) readIMG(frameChannel chan *FrameData) {
	defer func() {
		if err := recover(); err != nil {
			utils.Logger("FFmpeg").Printf("FFmpeg(%s) readIMG Err: %v", f.Name, err)
		}
		fmt.Println("readIMG close")
		f.Close()
	}()
	buffer := make([]byte, 4*1024*1024)
	imgBuffer := bytes.NewBuffer(make([]byte, 0, 8*1024*1024))
	// 记录当前状态
	var imgStart bool
	var markerPos int
	for {
		select {
		case <-f.closeChan:
			fmt.Println("readIMG get close sign")
			return
		default:
			n, err := f.imgReader.Read(buffer)
			if err != nil {
				if errors.Is(err, io.ErrClosedPipe) || errors.Is(err, io.EOF) {
					return
				}
				utils.Logger("FFmpeg").Printf("FFmpeg(%s) 读取图像数据错误: %v\n", f.Name, err)
				return
			}
			if n == 0 {
				continue
			}
			imgBuffer.Write(buffer[:n])
			data := imgBuffer.Bytes()
			dataLen := len(data)
			// 如果还没找到图像开始
			if !imgStart && dataLen >= 2 {
				// 快速查找JPEG开始标记 (0xFF 0xD8)
				for i := 0; i <= dataLen-2; i++ {
					if data[i] == 0xFF && data[i+1] == SOI {
						imgStart = true
						// 可以移除开始标记之前的数据
						if i > 0 {
							imgBuffer = bytes.NewBuffer(data[i:])
							data = imgBuffer.Bytes()
							dataLen = len(data)
						}
						break
					}
				}
			}
			// 已找到开始标记，现在寻找结束标记
			if imgStart && dataLen >= 2 {
				// 从上次查找位置开始找结束标记，避免重复扫描
				for i := markerPos; i <= dataLen-2; i++ {
					if data[i] == 0xFF && data[i+1] == EOI {
						// 找到了完整图像 (包括结束标记)
						completeImage := data[:i+2]
						// 处理图像数据
						f.processCompleteImage(completeImage, frameChannel)
						// 重置状态
						if i+2 < dataLen {
							// 保留剩余数据
							imgBuffer = bytes.NewBuffer(data[i+2:])
						} else {
							// 清空缓冲区
							imgBuffer.Reset()
						}
						imgStart = false
						markerPos = 0
						break
					}
				}

				// 如果没找到结束标记，更新查找位置
				if imgStart {
					// 保存当前位置，但回退1个字节以防止标记被分割
					markerPos = max(0, dataLen-1)
				}
			}
		}
	}
}
func (f *FFmpeg) processCompleteImage(imageData []byte, frameChannel chan *FrameData) {
	// 找到完整图像，从frameDataChan读取对应的时间戳信息
	// 简化处理，可能需要更精确的帧与时间戳匹配逻辑
	select {
	case frameData, ok := <-f.frameDataChan:
		if !ok {
			return // 通道已关闭
		}
		// 更新帧数据
		frameData.Data = make([]byte, len(imageData))
		copy(frameData.Data, imageData)
		if len(frameChannel) == cap(frameChannel) {
			fmt.Println("chan is full.")
			f.frameTempLock.Lock()
			f.frameDataTemp = append(f.frameDataTemp, frameData)
			f.frameTempLock.Unlock()
		} else {
			if len(f.frameDataTemp) > 0 && !f.frameTempClearing {
				go f.clearFrameDataTemp(frameChannel)
				f.frameDataTemp = append(f.frameDataTemp, frameData)
			} else {
				frameChannel <- frameData
			}
		}
	default:
		if len(frameChannel) == cap(frameChannel) {
			//TODO
		} else {
			// 没有对应的时间戳，使用空时间戳
			frameChannel <- &FrameData{
				Data:      imageData,
				Timestamp: 0,
				Index:     -1,
			}
		}
	}
}

// 清理临时帧数据
func (f *FFmpeg) clearFrameDataTemp(frameChannel chan *FrameData) {
	f.frameTempLock.Lock()
	f.frameTempClearing = true
	fmt.Println("chan is available,clear temp.")
	defer func() {
		fmt.Println("clear close,temp is empty:", len(f.frameDataTemp) == 0)
		f.frameTempClearing = false
		f.frameTempLock.Unlock()
	}()
	for len(frameChannel) < cap(frameChannel) && len(f.frameDataTemp) > 0 {
		tempData := f.frameDataTemp[0]
		f.frameDataTemp = f.frameDataTemp[1:]
		frameChannel <- tempData
	}
}
func (f *FFmpeg) Close() {
	f.closeChanLock.Do(func() {
		if f.cmd != nil && f.cmd.Process != nil {
			_ = f.cmd.Process.Kill()
		}
		close(f.closeChan)
		utils.Logger("FFmpeg").Printf("FFmpeg(%s)已关闭", f.Name)
	})
}
