package ffmpeg

import (
	"bufio"
	"errors"
	"fmt"
	"io"
	"os/exec"
	"path/filepath"
	"regexp"
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
	outputDir       string
	outputTemplate  string
	originStream    *io.PipeReader
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
	var frameIndex int64
	for scanner.Scan() {
		line := scanner.Text()
		if strings.Contains(line, "pts_time") {
			re := regexp.MustCompile(`pts_time:([\d.]+)`)
			matches := re.FindStringSubmatch(line)
			if len(matches) > 1 {
				timestamp := matches[1]
				fmt.Printf("Frame %d: PTS = %s秒\n", frameIndex, timestamp)
				f.stampsLock.Lock()
				f.frameTimestamps = append(f.frameTimestamps, timestamp)
				f.stampsLock.Unlock()
				frameIndex++
			}
		}
	}
}
func (f *FFmpeg) AddClearStamp(gap time.Duration, keepFrames int) *FFmpeg {
	if gap <= 0 {
		gap = 5 * time.Second
	}
	f.clearGap = gap
	if keepFrames <= 0 {
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
