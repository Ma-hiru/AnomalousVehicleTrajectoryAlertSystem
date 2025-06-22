package streamServer

import (
	"encoding/json"
	"io"
	"net/url"
	"os"
	"path/filepath"
	"server/core/ffmpeg"
	"server/settings"
	"server/socketServer"
	"server/utils"
	"strconv"
)

func HandleStreamWithMSE(pr *io.PipeReader, query url.Values) {
	defer pr.Close()
	defer utils.Logger("StreamServer").Println("视频帧处理结束")
	streamName := query.Get("src")
	imgFrame, metaData, err := ExtractVideoFramesWithStream(
		pr,
		settings.ExtractOptions(streamName),
	)
	if err != nil {
		utils.Logger("StreamServer").Println("抽帧失败")
	} else {
		utils.Logger("StreamServer").Println("开始处理视频帧")
		go readIMG(imgFrame, streamName)
		readMETA(metaData, streamName)
	}
}
func readIMG(imgFrame chan *ffmpeg.FrameData, StreamName string) {
	defer utils.Logger("StreamServer").Println("读取图片结束")
	for img := range imgFrame {
		//TODO yolo
		if msg, err := json.Marshal(socketServer.FrameMsg{
			StreamName: StreamName,
			Timestamp:  img.Timestamp,
			Data:       img.Index,
		}); err == nil {
			if IO, ok := socketServer.GetFramesSocketIO(); ok {
				IO.To(StreamName).Emit(socketServer.FrameEvent, string(msg))
			}
		} else {
			utils.Logger().Printf("FrameMsg转换json string错误%v\n", err)
		}
	}
}
func readMETA(metaData chan *ffmpeg.MetaData, StreamName string) {
	for meta := range metaData {
		utils.Logger("StreamServer").Println("MetaMsg=>", meta.Index, meta.Timestamp)
		if msg, err := json.Marshal(socketServer.MetaMsg{
			StreamName: StreamName + "_meta",
			Timestamp:  meta.Timestamp,
			Data:       meta.Index,
		}); err == nil {
			if IO, ok := socketServer.GetFramesSocketIO(); ok {
				IO.To(StreamName).Emit(socketServer.MetaEvent, string(msg))
			}
		} else {
			utils.Logger().Printf("MetaMsg转换json string错误%v\n", err)
		}
	}
}
func saveIMG(img *ffmpeg.FrameData, index int) {
	utils.Logger("StreamServer").Println("FrameMsg=>", img.Index, img.Timestamp)
	file, _ := os.Create(
		filepath.Join(
			"./frames",
			strconv.Itoa(index)+strconv.FormatInt(img.Index, 10)+
				"-"+strconv.FormatFloat(img.Timestamp, 'f', 6, 64)+".jpg",
		),
	)
	_, _ = file.Write(img.Data)
}
