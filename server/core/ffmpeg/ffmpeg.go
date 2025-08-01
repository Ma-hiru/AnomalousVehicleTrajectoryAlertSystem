package ffmpeg

import (
	"context"
	"errors"
	"fmt"
	"io"
	"os/exec"
	"strings"
)

type ffmpegMode uint8

const (
	NULL ffmpegMode = iota
	STREAM
	FILE
)

type ArgsMap = map[string]string
type FFmpeg struct {
	Name string

	inputOpt  []string
	outputOpt []string
	finalArgs []string

	originPath   string
	originStream *io.PipeReader
	mode         ffmpegMode

	cmd *exec.Cmd
	log *io.ReadCloser

	context context.Context
	cancel  context.CancelFunc
	plugin  []func(ffmpeg *FFmpeg)
}

func NewFFmpeg(name string, originStream *io.PipeReader, originPath string) (*FFmpeg, error) {
	ctx, cancel := context.WithCancel(context.Background())
	f := &FFmpeg{
		Name:      name,
		inputOpt:  []string{},
		outputOpt: []string{},
		finalArgs: []string{},
		plugin:    make([]func(ffmpeg *FFmpeg), 0),
		context:   ctx,
		cancel:    cancel,
	}
	if originStream != nil {
		f.originStream = originStream
		f.mode = STREAM
	} else if originPath != "" {
		f.originPath = originPath
		f.mode = FILE
	} else {
		f.mode = NULL
		return nil, errors.New("输入源无效")
	}
	return f, nil
}
func (f *FFmpeg) AddInputOptMap(args map[string]string) *FFmpeg {
	for key, value := range args {
		f.AddInputOpt(key, value)
	}
	return f
}
func (f *FFmpeg) AddInputOpt(key string, value string) *FFmpeg {
	if key != "" && value != "" {
		if strings.HasPrefix(key, "-") {
			f.inputOpt = append(f.inputOpt, key, value)
		} else {
			f.inputOpt = append(f.inputOpt, "-"+key, value)
		}
	}
	return f
}
func (f *FFmpeg) AddOutputOptMap(args map[string]string) *FFmpeg {
	for key, value := range args {
		f.AddOutputOpt(key, value)
	}
	return f
}
func (f *FFmpeg) AddOutputOpt(key string, value string) *FFmpeg {
	if key != "" && value != "" {
		if strings.HasPrefix(key, "-") {
			f.outputOpt = append(f.outputOpt, key, value)
		} else {
			f.outputOpt = append(f.outputOpt, "-"+key, value)
		}
	}
	return f
}
func (f *FFmpeg) AddPlugin(plugin func(ffmpeg *FFmpeg)) *FFmpeg {
	f.plugin = append(f.plugin, plugin)
	return f
}
func (f *FFmpeg) Build(out string) *FFmpeg {
	// build args
	f.finalArgs = append(f.finalArgs, f.inputOpt...)
	if f.mode == STREAM {
		f.finalArgs = append(f.finalArgs, "-i", "pipe:0")
	} else {
		f.finalArgs = append(f.finalArgs, "-i", f.originPath)
	}
	f.finalArgs = append(f.finalArgs, f.outputOpt...)
	f.finalArgs = append(f.finalArgs, out)
	// build cmd
	f.cmd = exec.Command("ffmpeg", f.finalArgs...)
	errPipe, _ := f.cmd.StderrPipe()
	if f.mode == STREAM {
		f.cmd.Stdin = f.originStream
	}
	f.log = &errPipe
	return f
}
func (f *FFmpeg) Run() error {
	if f.cmd == nil {
		return errors.New("未构建命令")
	}
	if f.mode == NULL {
		return errors.New("未指定输入源")
	}
	for _, plugin := range f.plugin {
		go plugin(f)
	}
	if err := f.cmd.Start(); err != nil {
		f.cancel()
		return fmt.Errorf("启动ffmpeg失败: %w", err)
	}
	go func() {
		defer f.cancel()
		if err := f.cmd.Wait(); err != nil {
			fmt.Printf("抽帧出错: %s", err.Error())
		}
	}()
	return nil
}
