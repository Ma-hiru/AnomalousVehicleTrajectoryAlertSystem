package ffmpeg

import (
	"bytes"
	"context"
	"errors"
	ffmpeggo "github.com/u2takey/ffmpeg-go"
	"io"
	"os"
	"os/exec"
	"time"
)

type InputOption struct {
	// 实时流速度 (example "" )
	Re string `json:"re"`
	// 全局线程数
	Threads string `json:"threads"`
	// 音频同步阈值 (example "1" )
	Async string `json:"async"`
	// 视频同步方法 (example "1" )
	Vsync string `json:"vsync"`
	// CUDA硬件加速 (example "cuda" )
	Hwaccel string `json:"hwaccel"`
	// 显存输出格式 (example "cuda" )
	HwaccelOutputFormat string `json:"hwaccelOutputFormat"`
}
type OutputOption struct {
	// NVIDIA编码器 (example "h264_nvenc")
	CV string `json:"c:v"`
	// 编码预设档 (example "p6")
	Preset string `json:"preset"`
	// 视频码率 (example "1500k")
	BV string `json:"b:v"`
	// 最大码率 (example "3000k")
	Maxrate string `json:"maxrate"`
	// 码率缓冲区 (example "6000k")
	Bufsize string `json:"bufsize"`
	// 帧率 (example "30")
	R string `json:"r"`
	// GOP大小 (example "60")
	G string `json:"g"`
	// B帧数量 (example "0")
	Bf string `json:"bf"`
	// H.264档次 (example "high")
	ProfileV string `json:"profile:v"`
	// 音频编码 (example "aac")
	CA string `json:"c:a"`
	// 音频码率 (example "128k")
	BA string `json:"b:a"`
	// RTSP传输协议 (example "tcp")
	RtspTransport string `json:"rtsp_transport"`
	// 禁用Nagle算法 (example "1")
	TcpNodelay string `json:"tcp_nodelay"`
	// 输出格式 (example "rtsp")
	F string `json:"f"`
}
type RtspServerConfig struct {
	FilePath   string
	ConfigPath string
}
type SimulateStreamsOptions struct {
	FilePath         string
	FileOutput       string
	RtspServerConfig RtspServerConfig
	InputOption      InputOption
	OutputOption     OutputOption
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
			"stream_loop":           "-1",
			"re":                    options.InputOption.Re,
			"threads":               options.InputOption.Threads,
			"async":                 options.InputOption.Async,
			"vsync":                 options.InputOption.Vsync,
			"hwaccel":               options.InputOption.Hwaccel,
			"hwaccel_output_format": options.InputOption.HwaccelOutputFormat,
		}).
		//WithInput(inputReader).
		Output(options.FileOutput,
			ffmpeggo.KwArgs{
				"c:v":            options.OutputOption.CV,
				"preset":         options.OutputOption.Preset,
				"b:v":            options.OutputOption.BV,
				"maxrate":        options.OutputOption.Maxrate,
				"bufsize":        options.OutputOption.Bufsize,
				"r":              options.OutputOption.R,
				"g":              options.OutputOption.G,
				"bf":             options.OutputOption.Bf,
				"profile:v":      options.OutputOption.ProfileV,
				"c:a":            options.OutputOption.CA,
				"b:a":            options.OutputOption.BA,
				"rtsp_transport": options.OutputOption.RtspTransport,
				"tcp_nodelay":    options.OutputOption.TcpNodelay,
				"f":              options.OutputOption.F,
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
