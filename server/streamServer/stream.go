package streamServer

import (
	"context"
	"fmt"
	"io"
	"path/filepath"
	"server/core/ffmpeg"
	"strconv"
	"strings"
)

func ExtractVideoFrames(streams *io.PipeReader, options ffmpeg.ExtractFramesOptions) ([]string, error) {
	NewFFmpeg, err := ffmpeg.NewFFmpeg(options.Name, streams, options.InputPath, context.Background())
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
	var res = NewFFmpeg.
		Build(
			filepath.Join(options.OutputDir, options.OutputTemplate),
		).
		Run()
	if res.IsErr() {
		return nil, res.UnwrapErr()
	}
	return nil, nil
}

// ExtractVideoFramesWithStream 从视频流中提取帧并通过channel返回帧数据
func ExtractVideoFramesWithStream(streams *io.PipeReader, options ffmpeg.ExtractFramesOptions, ctx context.Context) (chan *ffmpeg.FrameData, error) {
	NewFFmpeg, err := ffmpeg.NewFFmpeg(
		options.Name,
		streams,
		options.InputPath,
		ctx,
	)
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
	NewFFmpeg.
		AddPlugin(ffmpeg.StreamPlugin(frameChannel)).
		Build("-").
		Run().
		OnErr(func(err error) {
			fmt.Println(err)
		})

	return frameChannel, nil
}
