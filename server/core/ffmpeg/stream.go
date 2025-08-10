package ffmpeg

import (
	"bufio"
	"bytes"
	"context"
	"fmt"
	"io"
	"regexp"
	"shiina-mahiru.cn/gin_server/pkg/logger"
	"strconv"
	"strings"
)

// JPEG开始和结束标记
const (
	SOI = 0xD8 // Start of Image marker (after 0xFF)
	EOI = 0xD9 // End of Image marker (after 0xFF)
)

func StreamPlugin(out chan<- *FrameData) func(f *FFmpeg) {
	internal := make(chan *FrameData, 100)
	return func(f *FFmpeg) {
		go func() {
			defer func() {
				if err := recover(); err != nil {
					logger.New("FFmpeg").Printf("FFmpeg(%s) StreamPlugin Err: %v", f.Name, err)
				}
			}()
			select {
			case <-f.context.Done():
				fmt.Println("StreamPlugin get close sign")
				close(internal)
				close(out)
				if f.cmd != nil && f.cmd.Process != nil {
					err := f.cmd.Process.Kill()
					if err != nil {
						panic(err)
					}
				}
			}
		}()
		go timeStamp(f, internal)
		go readIMG(f, internal, out)
	}
}

func timeStamp(ffmpeg *FFmpeg, internal chan<- *FrameData) {
	defer func() {
		if err := recover(); err != nil {
			logger.New("FFmpeg").Printf("FFmpeg(%s) readTimeStamp Err: %v", ffmpeg.Name, err)
		}
		fmt.Println("timeStamp close")
		ffmpeg.cancel()
	}()
	//[Parsed_showinfo_1 @ 000002666e8d97c0] n:  12 pts:     12 pts_time:4       duration:      1 duration_time:0.333333 fmt:nv12 cl:left sar:1/1 s:1920x1080 i:P iskey:0 type:P checksum:7429297B plane_checksum:[5DAAB2C5 BBE676A7] mean:[163 128] stdev:[91.0 0.0]
	//n：帧序号
	//pts/pts_time：时间戳及对应时间
	//duration/duration_time：持续时长
	//fmt：像素格式
	//s：分辨率
	//i：帧类型（I/P/B）
	//iskey：是否为关键帧
	//checksum：校验值
	scanner := bufio.NewScanner(*ffmpeg.log)
	var frameIndex int64
	var frameRegex = regexp.MustCompile(`pts_time:([\d.]+)`)
	//logRegex := regexp.MustCompile(pattern)
	for scanner.Scan() {
		select {
		case <-ffmpeg.context.Done():
			fmt.Println("timeStamp get close sign")
			return
		default:
			line := scanner.Text()
			if strings.Contains(line, "pts_time") {
				// 基本时间戳提取
				matches := frameRegex.FindStringSubmatch(line)
				if len(matches) > 1 {
					timestamp := matches[1]
					fmt.Printf("Original frame %d: PTS = %s秒\n", frameIndex, timestamp)
					float, _ := strconv.ParseFloat(timestamp, 64)
					internal <- &FrameData{
						Data:      nil,
						Timestamp: float,
						Index:     frameIndex,
					}
					frameIndex++
				}
			}
		}
	}
}
func readIMG(ffmpeg *FFmpeg, internal chan *FrameData, out chan<- *FrameData) {
	defer func() {
		if err := recover(); err != nil {
			logger.New("FFmpeg").Printf("FFmpeg(%s) readIMG Err: %v", ffmpeg.Name, err)
		}
		fmt.Println("readIMG close")
		ffmpeg.cancel()
	}()
	imgReader, imgWriter := io.Pipe()
	ffmpeg.cmd.Stdout = imgWriter
	buffer := make([]byte, 4*1024*1024)
	imgBuffer := bytes.NewBuffer(make([]byte, 0, 8*1024*1024))
	// 记录当前状态
	var imgStart bool
	var markerPos int
	for {
		select {
		case <-ffmpeg.context.Done():
			fmt.Println("readIMG get close sign")
			return
		default:
			n, err := imgReader.Read(buffer)
			if err != nil {
				logger.New("FFmpeg").Printf("FFmpeg(%s) 读取图像数据: %v\n", ffmpeg.Name, err.Error())
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
						processCompleteImage(completeImage, internal, out, ffmpeg.context)
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
func processCompleteImage(imageData []byte, internal chan *FrameData, out chan<- *FrameData, ctx context.Context) {
	select {
	case <-ctx.Done():
		fmt.Println("processCompleteImage get close sign")
		return
	case frameData, ok := <-internal:
		if !ok {
			return // 通道已关闭
		}
		frameData.Data = imageData
		out <- frameData
	default:
		out <- &FrameData{
			Data:      imageData,
			Timestamp: -1,
			Index:     -1,
		}
	}
}
