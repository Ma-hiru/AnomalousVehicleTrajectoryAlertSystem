package streamServer

import (
	"encoding/json"
	"fmt"
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
	if imgFrame, err := ExtractVideoFramesWithStream(pr, options); err != nil {
		log.Error().Err(err).Msg("抽帧失败")
	} else {
		fmt.Println("开始处理视频帧")
		var index = 0
		for img := range imgFrame {
			fmt.Println(img.Index, img.Timestamp)
			//file, _ := os.Create(filepath.Join("./frames",
			//	strconv.Itoa(index)+strconv.FormatInt(img.Index, 10)+
			//		"-"+strconv.FormatFloat(img.Timestamp, 'f', 6, 64)+".jpg"))
			//_, _ = file.Write(img.Data)
			if msg, err := json.Marshal(socketServer.FrameMsg{
				StreamName: query.Get("src"),
				Timestamp:  img.Timestamp,
				Data:       img.Index,
			}); err == nil {
				socketServer.FramesSocketIO.To(query.Get("src")).Emit(socketServer.FrameEvent, string(msg))
			} else {
				utils.Logger().Printf("FrameMsg转换json string错误%v\n", err)
			}
			index++
		}
		fmt.Println("视频帧处理结束")
	}
}
