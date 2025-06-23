package test

import (
	"context"
	"github.com/fatih/color"
	"os"
	"path/filepath"
	"server/core/functional"
	yolov8 "server/core/yolo_grpc"
	"server/utils"
	"time"
)

func YoloSimulate() {
	var (
		timeStamp  float32            = 0
		index      int64              = 0
		streamName                    = "Test"
		imgData    []byte             = nil
		err        error              = nil
		yolo       *yolov8.YoloClient = nil
	)
	if imgData, err = os.ReadFile(filepath.Join("./test.png")); err != nil {
		utils.Logger("TEST").Println("No Data Read")
		return
	}
	functional.SetInterval(func(cancel context.CancelFunc) {
		if yolo == nil {
			yolo = yolov8.GetClient()
		}
		res, err := yolo.DetectSingle(context.Background(), &yolov8.ImageRequest{
			Id:        streamName,
			Data:      imgData,
			Timestamp: timeStamp,
			Index:     index,
		})
		if err != nil {
			utils.Logger("TEST").SetColor(color.FgHiRed).Println(err.Error())
			cancel()
			return
		}
		utils.
			Logger("YOLO").
			Printf(
				"YOLO Result(%v):\nfirt=>\n	%v\nlen=>\n	%v",
				index, res.Detections[0], len(res.Detections),
			)
		index++
		timeStamp += 1 / 3
	}, time.Second*5)
	select {}
}
