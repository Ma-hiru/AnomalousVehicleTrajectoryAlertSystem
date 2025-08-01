package streamServer

import (
	"bytes"
	"errors"
	"fmt"
	ffmpeggo "github.com/u2takey/ffmpeg-go"
	"io"
	"os/exec"
	"path/filepath"
	"runtime"
	"server/core/ffmpeg"
	"strconv"
	"strings"
)

func SimulateStreams(options ffmpeg.SimulateStreamsOptions) error {
	if err := startRTSP(options.RtspServerConfig.FilePath, options.RtspServerConfig.ConfigPath); err != nil {
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

func ExtractVideoFrames(streams *io.PipeReader, options ffmpeg.ExtractFramesOptions) ([]string, error) {
	NewFFmpeg, err := ffmpeg.NewFFmpeg(options.Name, streams, options.InputPath)
	if err != nil {
		return nil, err
	}
	if err = ffmpeg.Mkdir(options.OutputDir); err != nil {
		return nil, err
	}
	//输入参数
	NewFFmpeg.AddInputOptMap(ffmpeg.ArgsMap{
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
	NewFFmpeg.AddOutputOptMap(ffmpeg.ArgsMap{
		"qscale:v": fmt.Sprintf("%d", options.OutputOpt.Quality),
		"f":        options.OutputOpt.OutputFormat,
		"fps_mode": options.OutputOpt.FpsMode,
	})

	if err = NewFFmpeg.Build(filepath.Join(options.OutputDir, options.OutputTemplate)).Run(); err != nil {
		return nil, err
	}
	return nil, nil
}

// ExtractVideoFramesWithStream 从视频流中提取帧并通过channel返回帧数据
func ExtractVideoFramesWithStream(streams *io.PipeReader, options ffmpeg.ExtractFramesOptions) (chan *ffmpeg.FrameData, error) {
	NewFFmpeg, err := ffmpeg.NewFFmpeg(options.Name, streams, options.InputPath)
	if err != nil {
		return nil, err
	}
	// 输入参数
	NewFFmpeg.AddInputOptMap(ffmpeg.ArgsMap{
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

	// 确保输出格式为image2pipe
	NewFFmpeg.AddOutputOpt("f", "image2pipe")

	// 如果图片格式未指定，默认使用jpg
	imgFormat := options.OutputOpt.ImageFormat
	if imgFormat == "" {
		imgFormat = "jpg"
	}
	// 添加输出图片格式
	NewFFmpeg.AddOutputOpt("c:v", "mjpeg")

	// 输出参数
	NewFFmpeg.AddOutputOptMap(ffmpeg.ArgsMap{
		"qscale:v": fmt.Sprintf("%d", options.OutputOpt.Quality),
		"fps_mode": options.OutputOpt.FpsMode,
	})

	frameChannel := make(chan *ffmpeg.FrameData, 1000)
	//metaChannel := make(chan *ffmpeg.MetaData, 100)
	if err := NewFFmpeg.AddPlugin(ffmpeg.StreamPlugin(frameChannel)).Build("-").Run(); err != nil {
		fmt.Println(err)
	}
	return frameChannel, nil
}

func startRTSP(file, config string) error {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "windows":
		shellCmd := "pwsh"
		psCommand := fmt.Sprintf("& '%s' '%s'",
			filepath.Join(file),
			filepath.Join(config),
		)
		if _, err := exec.LookPath(shellCmd); err != nil {
			shellCmd = "powershell"
		}
		cmd = exec.Command("cmd.exe", "/C", "start", "", shellCmd, "-Command", psCommand)
	default:
		cmd = exec.Command(filepath.Join(file), filepath.Join(config))
	}
	if err := cmd.Start(); err != nil {
		return fmt.Errorf("启动RTSP服务失败: %w", err)
	}
	return nil
}
