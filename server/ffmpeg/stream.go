package ffmpeg

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	ffmpeggo "github.com/u2takey/ffmpeg-go"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

type SimulateInputOption struct {
	StreamLoop          string `json:"stream_loop"`         // 循环次数（-1为无限循环）
	Re                  string `json:"re"`                  // 实时流速度 (example "" )
	Threads             string `json:"threads"`             // 全局线程数
	Async               string `json:"async"`               // 音频同步阈值 (example "1" )
	Vsync               string `json:"vsync"`               // 视频同步方法 (example "1" )
	Hwaccel             string `json:"hwaccel"`             // CUDA硬件加速 (example "cuda" )
	HwaccelOutputFormat string `json:"hwaccelOutputFormat"` // 显存输出格式 (example "cuda" )
}
type SimulateOutputOption struct {
	CV            string `json:"c:v"`            // NVIDIA编码器 (example "h264_nvenc")
	Preset        string `json:"preset"`         // 编码预设档 (example "p6")
	BV            string `json:"b:v"`            // 视频码率 (example "1500k")
	Maxrate       string `json:"maxrate"`        // 最大码率 (example "3000k")
	Bufsize       string `json:"bufsize"`        // 码率缓冲区 (example "6000k")
	R             string `json:"r"`              // 帧率 (example "30")
	G             string `json:"g"`              // GOP大小 (example "60")
	Bf            string `json:"bf"`             // B帧数量 (example "0")
	ProfileV      string `json:"profile:v"`      // H.264档次 (example "high")
	CA            string `json:"c:a"`            // 音频编码 (example "aac")
	BA            string `json:"b:a"`            // 音频码率 (example "128k")
	RtspTransport string `json:"rtsp_transport"` // RTSP传输协议 (example "tcp")
	TcpNodelay    string `json:"tcp_nodelay"`    // 禁用Nagle算法 (example "1")
	F             string `json:"f"`              // 输出格式 (example "rtsp")
}
type RtspServerConfig struct {
	FilePath   string
	ConfigPath string
}
type SimulateStreamsOptions struct {
	FilePath         string
	FileOutput       string
	RtspServerConfig RtspServerConfig
	InputOpt         SimulateInputOption
	OutputOpt        SimulateOutputOption
}

func SimulateStreams(options SimulateStreamsOptions) error {
	//inputReader, _ := CreateLoopReader(options.FilePath)
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
		}).
		//WithInput(inputReader).
		Output(options.FileOutput,
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
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Hour)
	defer cancel()
	errBuf := bytes.NewBuffer(nil)
	cmd.Context = ctx
	err := cmd.WithErrorOutput(errBuf).Run()
	if err != nil {
		return errors.New(errBuf.String())
	}
	return nil
}

// CreateLoopReader 创建循环读取器模拟 -stream_loop -1
func CreateLoopReader(filePath string) (stream io.Reader, errChan chan error) {
	pr, pw := io.Pipe()
	go func() {
		defer func() {
			errChan <- pw.Close()
		}()
		for {
			file, err := os.Open(filePath)
			if err != nil {
				errChan <- errors.New("文件打开失败")
				return
			}
			_, err = io.Copy(pw, file)
			if err != nil {
				errChan <- errors.New("文件读取失败")
				return
			}
			err = file.Close()
			if err != nil {
				errChan <- errors.New("文件关闭失败")
				return
			}
		}
	}()
	return pr, errChan
}

type ExtractInputOption struct {
	StreamLoop int    // 循环次数（-1为无限循环）
	StartTime  string // 起始时间 hh:mm:ss
	Duration   string // 抽帧时长 hh:mm:ss
	Hwaccel    string `json:"hwaccel"` // CUDA硬件加速 (example "cuda" )
	CV         string `json:"c:v"`     // NVIDIA编码器 (example "h264_nvenc")
}
type ExtractOutputOption struct {
	FPS         int    // 抽帧频率（帧/秒）
	Quality     int    // 图片质量 1-31（越低越好）
	SelectMode  string // 抽帧模式: all/keyframe
	FrameType   string // 帧类型: I/P/B（需SelectMode=keyframe）
	ImageFormat string // 输出格式: jpg/png
	Vsync       string `json:"vsync"`    // 可变帧率模式(vfr)
	F           string `json:"f"`        // 输出图片序列(image2)
	Loglevel    string `json:"loglevel"` //warning
}
type ExtractFramesOptions struct {
	InputPath      string
	InputOpt       ExtractInputOption
	OutputDir      string
	OutputTemplate string // 文件名模板（如frame_%04d.jpg）
	OutputOpt      ExtractOutputOption
}

func ExtractVideoFrames(options ExtractFramesOptions) ([]string, error) {
	var file *os.File
	var err error
	if file, err = os.Open(options.OutputDir); err != nil {
		if err := os.MkdirAll(options.OutputDir, 0755); err != nil {
			return nil, err
		}
	}
	defer func() {
		_ = file.Close()
	}()
	// 视频过滤器配置
	var vfArgs []string
	if options.OutputOpt.SelectMode == "keyframe" {
		// 仅抽取I帧（关键帧）
		vfArgs = append(vfArgs, "select=eq(pict_type,+"+options.OutputOpt.FrameType+"+)")
	} else if options.OutputOpt.FPS > 0 {
		// 每秒抽取x帧
		vfArgs = append(vfArgs, fmt.Sprintf("fps=%d", options.OutputOpt.FPS))
	}
	cmd := ffmpeggo.Input(options.InputPath, ffmpeggo.KwArgs{
		"stream_loop": options.InputOpt.StreamLoop,
		"ss":          options.InputOpt.StartTime,
		"t":           options.InputOpt.Duration,
		"hwaccel":     options.InputOpt.Hwaccel,
		"c:v":         options.InputOpt.CV,
	}).Output(
		filepath.Join(options.OutputDir, options.OutputTemplate),
		ffmpeggo.KwArgs{
			"vf":       strings.Join(vfArgs, ","),
			"qscale:v": options.OutputOpt.Quality,
			"vsync":    options.OutputOpt.Vsync, // 可变帧率模式
			"f":        options.OutputOpt.F,     // 输出图片序列
			"loglevel": options.OutputOpt.Loglevel,
		})
	// 执行命令
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Hour)
	defer cancel()
	errBuf := bytes.NewBuffer(nil)
	cmd.Context = ctx
	if err := cmd.WithErrorOutput(errBuf).Run(); err != nil {
		return nil, errors.New(errBuf.String())
	}
	// 获取生成的文件列表
	pattern := fmt.Sprintf("*.%s", options.OutputOpt.ImageFormat)
	files, err := filepath.Glob(filepath.Join(options.OutputDir, pattern))
	if err != nil || len(files) == 0 {
		return nil, fmt.Errorf("未找到输出文件，请检查路径: %s", filepath.Join(options.OutputDir, pattern))
	}
	return files, nil
}
