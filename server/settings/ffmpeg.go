package settings

import (
	"path/filepath"
	"server/ffmpeg"
)

func ExtractOptions() ffmpeg.ExtractFramesOptions {
	return ffmpeg.ExtractFramesOptions{
		InputOpt: ffmpeg.ExtractInputOption{
			Hwaccel:     "cuda", //"qsv" "cuda"
			InputFormat: "mp4",
			Loglevel:    "debug",
			CV:          "h264",
		},
		OutputDir:      filepath.Join("./frames"),
		OutputTemplate: "frame_%08d.jpg",
		OutputOpt: ffmpeg.ExtractOutputOption{
			Quality:      2,
			SelectMode:   "all",
			FPS:          3,
			FpsMode:      "vfr",
			OutputFormat: "image2",
			FrameType:    "I",
		},
	}
}
