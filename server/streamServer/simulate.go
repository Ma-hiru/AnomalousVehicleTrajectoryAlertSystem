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
)

var videoPath = "./video/processed_video.mp4"
var config = ffmpeg.SimulateStreamsOptions{
	FilePath:   filepath.Join(videoPath),
	FileOutput: "rtsp://127.0.0.1:8554/live",
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
	RtspServerConfig: ffmpeg.RtspServerConfig{
		FilePath:   filepath.Join("./mediamtx/mediamtx.exe"),
		ConfigPath: filepath.Join("./mediamtx/mediamtx.yml"),
	},
}

func SimulateStream() {
	var isNvidia = utils.
		IsDevice(utils.Nvidia).
		Expect("Detect Nvidia Device Err")
	var isIntel = utils.
		IsDevice(utils.Intel).
		Expect("Detect Intel Device Err")

	if isNvidia {
		utils.
			Logger("streamServer").
			Println(
				"Detected Nvidia GPU, using NVENC for hardware acceleration.",
			)
		config.InputOpt.Hwaccel = "cuda"
		config.InputOpt.HwaccelOutputFormat = "cuda"
		config.OutputOpt.CV = "h264_nvenc"
		config.OutputOpt.Preset = "p6"
	} else if isIntel {
		utils.
			Logger("streamServer").
			Println(
				"Detected Intel GPU, using QSV for hardware acceleration.",
			)
		config.InputOpt.Hwaccel = "qsv"
		config.InputOpt.HwaccelOutputFormat = "qsv"
		config.OutputOpt.CV = "h264_qsv"
		config.OutputOpt.Preset = "veryfast"
	}

	res := simulate(config)
	if res.IsErr() {
		utils.
			Logger("streamServer").
			Println(
				"SimulateStreamsErr:", res.UnwrapErr(),
			)
		return
	}
}

func simulate(options ffmpeg.SimulateStreamsOptions) *enum.Result[bool] {
	startRTSP(options).Unwrap()

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
		return enum.Err[bool](
			fmt.Errorf(
				"run err: %v\n buf err: %v\n",
				err.Error(), errBuf.String(),
			),
		)
	}

	return enum.Ok(true)
}

func startRTSP(options ffmpeg.SimulateStreamsOptions) *enum.Result[bool] {
	var cmd *exec.Cmd
	var file = options.RtspServerConfig.FilePath
	var config = options.RtspServerConfig.ConfigPath
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
		return enum.Err[bool](fmt.Errorf("启动RTSP服务失败: %w", err))
	}
	return enum.Ok(true)
}
