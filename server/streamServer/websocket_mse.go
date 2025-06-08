package streamServer

import (
	"encoding/json"
	"github.com/rs/zerolog/log"
	"io"
	"net/url"
	"server/settings"
	"server/socketServer"
	"server/utils"
)

func HandleStreamWithMSE(pr *io.PipeReader, query url.Values) {
	defer pr.Close()
	// 设置抽帧配置，确保ImageFormat为jpg
	options := settings.ExtractOptions()
	options.OutputOpt.ImageFormat = "jpg"
	options.Name = query.Get("src")
	imgFrame, metaData, err := ExtractVideoFramesWithStream(pr, options)
	if err != nil {
		log.Error().Err(err).Msg("抽帧失败")
	} else {
		utils.Logger("StreamServer").Println("开始处理视频帧")
		go func() {
			for img := range imgFrame {
				utils.Logger("StreamServer").Println("FrameMsg=>", img.Index, img.Timestamp)
				//file, _ := os.Create(filepath.Join("./frames",
				//	strconv.Itoa(index)+strconv.FormatInt(img.Index, 10)+
				//		"-"+strconv.FormatFloat(img.Timestamp, 'f', 6, 64)+".jpg"))
				//_, _ = file.Write(img.Data)
				//TODO yolo
				if msg, err := json.Marshal(socketServer.FrameMsg{
					StreamName: query.Get("src"),
					Timestamp:  img.Timestamp,
					Data:       img.Index,
				}); err == nil {
					if IO, ok := socketServer.GetFramesSocketIO(); ok {
						IO.To(query.Get("src")).Emit(socketServer.FrameEvent, string(msg))
					}
				} else {
					utils.Logger().Printf("FrameMsg转换json string错误%v\n", err)
				}
			}
		}()
		for meta := range metaData {
			utils.Logger("StreamServer").Println("MetaMsg=>", meta.Index, meta.Timestamp)
			if msg, err := json.Marshal(socketServer.MetaMsg{
				StreamName: query.Get("src") + "_meta",
				Timestamp:  meta.Timestamp,
				Data:       meta.Index,
			}); err == nil {
				if IO, ok := socketServer.GetFramesSocketIO(); ok {
					IO.To(query.Get("src")).Emit(socketServer.MetaEvent, string(msg))
				}
			} else {
				utils.Logger().Printf("MetaMsg转换json string错误%v\n", err)
			}
		}
		utils.Logger("StreamServer").Println("视频帧处理结束")
	}
}
