package main

import (
	"errors"
	"log"
	"path/filepath"
	"server/app"
	"server/ffmpeg"
	"server/go2rtc"
	"server/settings"
	"server/utils"
)

func main() {
	errMsg := make(chan error)
	go func() {
		err := ffmpeg.SimulateStreams(ffmpeg.SimulateStreamsOptions{
			FilePath:   filepath.Join("./video/test.mp4"),
			FileOutput: "rtsp://127.0.0.1:8554/live",
			InputOption: ffmpeg.InputOption{
				Re:                  "",
				Threads:             "20",
				Async:               "1",
				Vsync:               "1",
				Hwaccel:             "cuda",
				HwaccelOutputFormat: "cuda",
			},
			OutputOption: ffmpeg.OutputOption{
				CV:            "h264_nvenc",
				Preset:        "p6",
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
				FilePath:   filepath.Join("./video/rtsp.exe"),
				ConfigPath: filepath.Join("./video/mediamtx.yml"),
			},
		})
		if err != nil {
			log.Println(err)
			errMsg <- errors.New("SimulateStreams exit")
		}
	}()
	go go2rtc.Run(errMsg)
	go func() {
		app.StartConfig(settings.IsSSL)
		defer func() {
			utils.PrintStack()
			errMsg <- errors.New("gin exit")
		}()
		instance := app.CreateApp()
		app.ConfigApp(instance)
		app.RunConfig(instance)
	}()
	log.Println(<-errMsg)
}
