package streamServer

import (
	"encoding/json"
	"github.com/rs/zerolog/log"
	"io"
	"net/url"
	"server/core/ffmpeg"
	"server/settings"
	"server/socketServer"
	"server/utils"
	"sync"
)

const Suffix = "'"

var (
	ffmpegInstances = make(map[string]*ffmpeg.FFmpeg)
	ffmpegMutex     sync.Mutex
)

func HandleStreamWithMSE(pr *io.PipeReader, query url.Values) {
	defer pr.Close()
	defer utils.Logger("StreamServer").Println("视频帧处理结束")
	streamName := query.Get("src")
	// 设置抽帧配置，确保ImageFormat为jpg
	options := settings.ExtractOptions()
	options.OutputOpt.ImageFormat = "jpg"
	options.Name = streamName

	//var ffmpegInstance *ffmpeg.FFmpeg
	imgFrame, metaData, err := ExtractVideoFramesWithStream(pr, options)
	//// 保存FFmpeg实例以便后续关闭
	//if ffmpegInstance != nil {
	//	ffmpegMutex.Lock()
	//	if _, ok := ffmpegInstances[streamName]; ok {
	//		streamName += Suffix
	//		ffmpegInstances[streamName] = ffmpegInstance
	//		ffmpegInstance.Name = streamName
	//	} else {
	//		ffmpegInstances[streamName] = ffmpegInstance
	//	}
	//	ffmpegMutex.Unlock()
	//}
	//// 在函数结束时清理FFmpeg实例
	//defer func() {
	//	ffmpegMutex.Lock()
	//	delete(ffmpegInstances, streamName)
	//	ffmpegMutex.Unlock()
	//}()
	if err != nil {
		log.Error().Err(err).Msg("抽帧失败")
	} else {
		utils.Logger("StreamServer").Println("开始处理视频帧")
		go func() {
			defer utils.Logger("StreamServer").Println("读取图片结束")
			for img := range imgFrame {
				//utils.Logger("StreamServer").Println("FrameMsg=>", img.Index, img.Timestamp)
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
	}
}

//// CloseStreamFFmpeg 添加一个函数用于关闭特定流的FFmpeg实例
//func CloseStreamFFmpeg(streamName string) {
//	ffmpegMutex.Lock()
//	defer ffmpegMutex.Unlock()
//	if instance, exists := ffmpegInstances[streamName]; exists {
//		instance.Close()
//		delete(ffmpegInstances, streamName)
//		CloseStreamFFmpeg(streamName + Suffix)
//	}
//}
