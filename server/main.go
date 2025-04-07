package main

import (
	"path/filepath"
	"server/ffmpeg"
	"server/yolo"
)

func main() {
	//errMsg := make(chan error)
	//go simulate(errMsg)
	//go go2rtc.Run(errMsg)
	//go app.Init(routes.UseRoutes, static.UseStatic)
	//log.Println(<-errMsg)
	//yolo.Test(filepath.Join("./yolo/yolov8n.onnx"), filepath.Join("./yolo/test.jpg"), filepath.Join("./yolo/res.jpg"))
	yolo.Init(filepath.Join("./yolo/yolov8n.onnx"), filepath.Join("./yolo/test.jpg"), filepath.Join("./yolo/res.jpg"))
}
func simulate(errMsg chan<- error) {
	errMsg <- ffmpeg.SimulateStreams(ffmpeg.SimulateStreamsOptions{
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
			FilePath:   filepath.Join("./mediamtx/mediamtx.exe"),
			ConfigPath: filepath.Join("./mediamtx/mediamtx.yml"),
		},
	})
}
