package streamServer

import (
	"bytes"
	"fmt"
	ffmpeggo "github.com/u2takey/ffmpeg-go"
	"os/exec"
	"path/filepath"
	"runtime"
	"server/core/enum"
	"server/core/ffmpeg"
	"server/utils"
	"sync"
)

const defaultVideoPath = "./video/奉化大桥.mp4"
const defaultOutput = "rtsp://127.0.0.1:8554/live"
const defaultRtspPath = "./mediamtx/mediamtx.exe"
const defaultRtspCfg = "./mediamtx/mediamtx.yml"

func SimulateServer() {
	wait := sync.WaitGroup{}
	wait.Add(2)

	go func() {
		NewSimulate(defaultVideoPath, defaultOutput).
			Expect("启动RTSP服务失败")
		wait.Done()
		fmt.Println("live close")
	}()

	go func() {
		NewSimulate(
			"./video/路口.mp4", "rtsp://127.0.0.1:8554/live2",
		).
			Expect("启动RTSP服务失败")
		wait.Done()
		fmt.Println("live2 close")
	}()

	wait.Wait()
}

func NewSimulate(path, out string) *enum.Result[enum.None] {
	return NewSimulateConfig(path, out).
		SetDevice().
		RtspConfig(defaultRtspPath, defaultRtspCfg).
		StartRTSP().
		Expect("ffmpeg配置错误").
		Simulate()
}

type SimulateConfig struct {
	ffmpeg *ffmpeg.SimulateStreamsOptions
}

func NewSimulateConfig(path, out string) *SimulateConfig {
	if path == "" {
		path = defaultVideoPath
	}
	if out == "" {
		out = defaultOutput
	}
	return &SimulateConfig{
		ffmpeg: &ffmpeg.SimulateStreamsOptions{
			FilePath:   filepath.Join(path),
			FileOutput: out,
			InputOpt: ffmpeg.SimulateInputOption{
				StreamLoop:          "-1",
				Re:                  "",
				Threads:             "20",
				Async:               "1",
				Vsync:               "1",
				Hwaccel:             "cuda", //"qsv" "cuda"
				HwaccelOutputFormat: "cuda", //"qsv" "cuda"
			},
			OutputOpt: ffmpeg.SimulateOutputOption{
				CV:            "h264_nvenc", //"h264_qsv" "h264_nvenc"
				Preset:        "p6",         //"veryfast" "p6"
				BV:            "1500k",
				Maxrate:       "3000k",
				Bufsize:       "4500k",
				R:             "30",
				G:             "60",
				Bf:            "0",
				ProfileV:      "high",
				CA:            "aac",
				BA:            "128k",
				RtspTransport: "tcp",
				TcpNodelay:    "1",
				F:             "rtsp",
			},
		},
	}
}

func (config *SimulateConfig) SetDevice() *SimulateConfig {
	var isNvidia = utils.
		IsDevice(utils.Nvidia).
		Expect("Detect Device Err")
	var isIntel = utils.
		IsDevice(utils.Intel).
		Expect("Detect Device Err")

	if isNvidia {
		utils.
			Logger("streamServer").
			Println(
				"Detected Nvidia GPU, using NVENC for hardware acceleration.",
			)
		config.ffmpeg.InputOpt.Hwaccel = "cuda"
		config.ffmpeg.InputOpt.HwaccelOutputFormat = "cuda"
		config.ffmpeg.OutputOpt.CV = "h264_nvenc"
		config.ffmpeg.OutputOpt.Preset = "p6"
	} else if isIntel {
		utils.
			Logger("streamServer").
			Println(
				"Detected Intel GPU, using QSV for hardware acceleration.",
			)
		config.ffmpeg.InputOpt.Hwaccel = "qsv"
		config.ffmpeg.InputOpt.HwaccelOutputFormat = "qsv"
		config.ffmpeg.OutputOpt.CV = "h264_qsv"
		config.ffmpeg.OutputOpt.Preset = "veryfast"
	}
	return config
}

func (config *SimulateConfig) RtspConfig(path, cfg string) *SimulateConfig {
	if path == "" {
		path = defaultRtspPath
	}
	if cfg == "" {
		cfg = defaultRtspCfg
	}
	config.ffmpeg.RtspServerConfig = ffmpeg.RtspServerConfig{
		FilePath:   filepath.Join(path),
		ConfigPath: filepath.Join(cfg),
	}
	return config
}

func (config *SimulateConfig) Simulate() *enum.Result[enum.None] {
	options := config.ffmpeg
	errBuf := bytes.NewBuffer(nil)
	err := ffmpeggo.
		Input(options.FilePath,
			ffmpeggo.KwArgs{
				"stream_loop":           options.InputOpt.StreamLoop,
				"re":                    options.InputOpt.Re,
				"threads":               options.InputOpt.Threads,
				"async":                 options.InputOpt.Async,
				"vsync":                 options.InputOpt.Vsync,
				"hwaccel":               options.InputOpt.Hwaccel,
				"hwaccel_output_format": options.InputOpt.HwaccelOutputFormat,
			}).
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
			}).
		WithErrorOutput(errBuf).
		Run()
	if err != nil {
		return enum.Err[enum.None](
			fmt.Errorf(
				"run err: %v\n buf err: %v\n",
				err.Error(), errBuf.String(),
			),
		)
	}

	return enum.Ok(enum.None{})
}

func (config *SimulateConfig) StartRTSP() *enum.Result[*SimulateConfig] {
	var cmd *exec.Cmd
	var options = config.ffmpeg
	var file = options.RtspServerConfig.FilePath
	var cfg = options.RtspServerConfig.ConfigPath
	switch runtime.GOOS {
	case "windows":
		shellCmd := "pwsh"
		psCommand := fmt.Sprintf("& '%s' '%s'",
			filepath.Join(file),
			filepath.Join(cfg),
		)
		if _, err := exec.LookPath(shellCmd); err != nil {
			shellCmd = "powershell"
		}
		cmd = exec.Command("cmd.exe", "/C", "start", "", shellCmd, "-Command", psCommand)
	default:
		cmd = exec.Command(filepath.Join(file), filepath.Join(cfg))
	}
	if err := cmd.Start(); err != nil {
		return enum.Err[*SimulateConfig](fmt.Errorf("启动RTSP服务失败: %w", err))
	}
	return enum.Ok(config)
}
