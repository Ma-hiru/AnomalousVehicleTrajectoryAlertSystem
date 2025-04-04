package ffmpeg

import (
	"bufio"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"regexp"
	"strconv"
	"strings"
	"sync"
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
	originStream    *io.PipeReader
	cmd             *exec.Cmd
	log             *io.ReadCloser
	stampsPath      string
	fileLock        sync.Mutex
	stampsFile      *os.File
	mode            ffmpegMode
	outTimestamps   bool
	frameTimestamps map[string]string
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
func (f *FFmpeg) AddInputFlag(key string) {
	f.inputOpt = append(f.inputOpt, key)
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
func (f *FFmpeg) AddOutputFlag(key string) {
	f.outputOpt = append(f.outputOpt, key)
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
	f.cmd = exec.Command("ffmpeg", f.finalArgs...)
	errPipe, _ := f.cmd.StderrPipe()
	f.log = &errPipe
	if f.mode == STREAM {
		f.cmd.Stdin = f.originStream
	}
	return f
}
func (f *FFmpeg) Run() error {
	if f.mode == NULL {
		return errors.New("未指定输入源")
	}
	if f.cmd == nil {
		return errors.New("ffmpeg cmd is null")
	}
	if f.outTimestamps {
		go f.timeStamp()
	}
	if err := f.cmd.Start(); err != nil {
		return fmt.Errorf("启动FFmpeg失败: %w", err)
	} else if err := f.cmd.Wait(); err != nil {
		return fmt.Errorf("抽帧出错: %w", err)
	}
	if f.stampsFile != nil {
		_ = f.stampsFile.Close()
	}
	fmt.Println("抽帧结束！")
	return nil
}
func (f *FFmpeg) AddTimeStamp(outputPath string) *FFmpeg {
	if outputPath == "" {
		return f
	}
	if f.stampsFile != nil {
		_ = f.stampsFile.Close()
	}
	if json, err := os.OpenFile(outputPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644); err != nil {
		fmt.Println("Error opening JSON file:", err)
		_ = json.Close()
		return f
	} else {
		f.stampsFile = json
	}
	f.stampsPath = outputPath
	f.outTimestamps = true
	return f
}
func (f *FFmpeg) timeStamp() {
	scanner := bufio.NewScanner(*f.log)
	var frameIndex int
	for scanner.Scan() {
		line := scanner.Text()
		if strings.Contains(line, "pts_time") {
			re := regexp.MustCompile(`pts_time:([\d.]+)`)
			matches := re.FindStringSubmatch(line)
			if len(matches) > 1 {
				timestamp := matches[1]
				fmt.Printf("Frame %d: PTS = %s秒\n", frameIndex, timestamp)
				if f.frameTimestamps == nil {
					f.frameTimestamps = make(map[string]string)
				}
				f.frameTimestamps[strconv.Itoa(frameIndex)] = timestamp
				if f.stampsFile != nil {
					f.fileLock.Lock()
					if _, err := f.stampsFile.WriteString(fmt.Sprintf("frame_%d.jpg %s\n", frameIndex, timestamp)); err != nil {
						fmt.Println("Error writing to JSON file:", err)
						_ = f.stampsFile.Close()
						f.stampsFile = nil
					}
					f.fileLock.Unlock()
				}
				frameIndex++
			}
		}
	}
}
