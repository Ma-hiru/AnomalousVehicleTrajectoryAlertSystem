package main

import (
	"errors"
	"fmt"
	"log"
	"path/filepath"
	"server/app"
	"server/ffmpeg"
	"server/go2rtc"
	"server/middleware"
	"server/routes"
	"server/static"
	"server/utils"
)

func main() {
	errMsg := make(chan error)
	go go2rtc.Run(errMsg)
	go simulate(errMsg)
	go extract(errMsg)
	go gin()
	log.Println(<-errMsg)
}
func gin() {
	app.Init(routes.UseRoutes, static.UseStatic)
	app.SetCors(middleware.Cors)
}
func simulate(errMsg chan<- error) {
	err := ffmpeg.SimulateStreams(ffmpeg.SimulateStreamsOptions{
		FilePath:   filepath.Join("./video/test.mp4"),
		FileOutput: "rtsp://127.0.0.1:8554/live",
		InputOpt: ffmpeg.SimulateInputOption{
			StreamLoop:          "-1",
			Re:                  "",
			Threads:             "20",
			Async:               "1",
			Vsync:               "1",
			Hwaccel:             "cuda",
			HwaccelOutputFormat: "cuda",
		},
		OutputOpt: ffmpeg.SimulateOutputOption{
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
	defer func() {
		utils.PrintStack()
		errMsg <- errors.New("SimulateStreams exit")
	}()
	if err != nil {
		log.Println(err)
	}
}
func extract(errMsg chan<- error) {
	options := ffmpeg.ExtractFramesOptions{
		InputPath: filepath.Join("./video/test_hd.mp4"),
		InputOpt: ffmpeg.ExtractInputOption{
			StreamLoop: 1,
			StartTime:  "00:00:05",
			Duration:   "00:00:35",
			Hwaccel:    "cuda",
			CV:         "h264_cuvid",
		},
		OutputDir:      filepath.Join("./frames"),
		OutputTemplate: "test_hd_frame_%04d.jpg",
		OutputOpt: ffmpeg.ExtractOutputOption{
			FPS:         2,
			Quality:     2,
			SelectMode:  "all",
			ImageFormat: "jpg",
			Vsync:       "vfr",
			F:           "image2",
			Loglevel:    "warning",
			FrameType:   "I",
		},
	}
	frames, err := ffmpeg.ExtractVideoFrames(options)
	defer func() {
		if err := recover(); err != nil {
			utils.PrintStack()
			errMsg <- errors.New("extracted exit")
		}
	}()
	if err != nil {
		log.Println(err)
		return
	}
	fmt.Printf("Extracted %d frames", len(frames))
}
