package ffmpeg

import (
	"bytes"
	"errors"
	"fmt"
	ffmpeggo "github.com/u2takey/ffmpeg-go"
	"io"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"time"
)

func SimulateStreams(options SimulateStreamsOptions) error {
	rtsp := exec.Command(options.RtspServerConfig.FilePath, options.RtspServerConfig.ConfigPath)
	rtsp.Stdout = os.Stdout
	rtsp.Stderr = os.Stderr
	if err := rtsp.Start(); err != nil {
		return err
	}
	cmd := ffmpeggo.Input(options.FilePath,
		ffmpeggo.KwArgs{
			"stream_loop":           options.InputOpt.StreamLoop,
			"re":                    options.InputOpt.Re,
			"threads":               options.InputOpt.Threads,
			"async":                 options.InputOpt.Async,
			"vsync":                 options.InputOpt.Vsync,
			"hwaccel":               options.InputOpt.Hwaccel,
			"hwaccel_output_format": options.InputOpt.HwaccelOutputFormat,
		}).Output(options.FileOutput,
		ffmpeggo.KwArgs{
			"c:v":            options.OutputOpt.CV,
			"preset":         options.OutputOpt.Preset,
			"b:v":            options.OutputOpt.BV,
			"maxrate":        options.OutputOpt.Maxrate,
			"bufsize":        options.OutputOpt.Bufsize,
			"r":              options.OutputOpt.R,
			"g":              options.OutputOpt.G,
			"bf":             options.OutputOpt.Bf,
			"profile:v":      options.OutputOpt.ProfileV,
			"c:a":            options.OutputOpt.CA,
			"b:a":            options.OutputOpt.BA,
			"rtsp_transport": options.OutputOpt.RtspTransport,
			"tcp_nodelay":    options.OutputOpt.TcpNodelay,
			"f":              options.OutputOpt.F,
		})
	errBuf := bytes.NewBuffer(nil)
	err := cmd.WithErrorOutput(errBuf).Run()
	if err != nil {
		return errors.New(errBuf.String())
	}
	return nil
}

func ExtractVideoFrames(streams *io.PipeReader, options ExtractFramesOptions) ([]string, error) {
	var NewFFmpeg FFmpeg
	var err error
	if err = NewFFmpeg.AddSource(streams, options.InputPath); err != nil {
		return nil, err
	}
	if err = mkdir(options.OutputDir); err != nil {
		return nil, err
	}
	//输入参数
	NewFFmpeg.AddInputMap(ArgsMap{
		"c:v":      options.InputOpt.CV,
		"loglevel": options.InputOpt.Loglevel,
		"f":        options.InputOpt.InputFormat,
		"hwaccel":  options.InputOpt.Hwaccel,
		"ss":       options.InputOpt.StartTime,
		"t":        options.InputOpt.Duration,
		"fflags":   options.InputOpt.Fflags,
	})
	if options.InputOpt.StreamLoop != 0 {
		NewFFmpeg.AddInputOpt("stream_loop", strconv.Itoa(options.InputOpt.StreamLoop))
	}
	// 视频过滤器配置
	var vfArgs []string
	if options.OutputOpt.SelectMode == "keyframe" {
		vfArgs = append(vfArgs, "select=eq(pict_type\\,"+options.OutputOpt.FrameType+"),showinfo")
	} else if options.OutputOpt.FPS > 0 {
		// 每秒抽取x帧
		vfArgs = append(vfArgs, fmt.Sprintf("fps=%d,showinfo", options.OutputOpt.FPS))
	}
	if len(vfArgs) > 0 {
		NewFFmpeg.AddOutputOpt("vf", strings.Join(vfArgs, ","))
	}
	// 输出参数
	NewFFmpeg.AddOutputMap(ArgsMap{
		"qscale:v": fmt.Sprintf("%d", options.OutputOpt.Quality),
		"f":        options.OutputOpt.OutputFormat,
		"fps_mode": options.OutputOpt.FpsMode,
	})
	NewFFmpeg.AddOutput(options.OutputDir, options.OutputTemplate)
	if err = NewFFmpeg.Build().AddTimeStamp().AddClearStamp(time.Second*5, 45).Run(); err != nil {
		return nil, err
	}
	return nil, nil
}
