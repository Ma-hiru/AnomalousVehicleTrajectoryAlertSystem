package mp4

import (
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"server/core/ffmpeg"
	"server/go2rtc/internal/api"
	"server/go2rtc/internal/api/ws"
	"server/go2rtc/internal/streams"
	"server/go2rtc/pkg/core"
	"server/go2rtc/pkg/mp4"
	"server/settings"
	"strconv"
)

func handlerWSMSE(tr *ws.Transport, msg *ws.Message) error {
	fmt.Println("handlerWSMSE")
	stream := streams.GetOrPatch(tr.Request.URL.Query())
	if stream == nil {
		return errors.New(api.StreamNotFound)
	}

	var medias []*core.Media
	if codecs := msg.String(); codecs != "" {
		log.Trace().Str("codecs", codecs).Msgf("[mp4] new WS/MSE consumer")
		medias = mp4.ParseCodecs(codecs, true)
	}

	cons := mp4.NewConsumer(medias)
	cons.FormatName = "mse/fmp4"
	cons.WithRequest(tr.Request)

	if err := stream.AddConsumer(cons); err != nil {
		log.Debug().Err(err).Msg("[mp4] add consumer")
		return err
	}

	tr.Write(&ws.Message{Type: "mse", Value: mp4.ContentType(cons.Codecs())})

	pr, pw := io.Pipe()
	go func() {
		defer func(pr *io.PipeReader) {
			_ = pr.Close()
		}(pr)

		// 设置抽帧配置，确保ImageFormat为jpg
		options := settings.ExtractOptions()
		options.OutputOpt.ImageFormat = "jpg"

		if imgFrame, err := ffmpeg.ExtractVideoFramesWithStream(pr, options); err != nil {
			log.Error().Err(err).Msg("抽帧失败")
		} else {
			fmt.Println("开始处理视频帧")
			var index = 0
			for img := range imgFrame {
				fmt.Println(img.Index, img.Timestamp)
				file, _ := os.Create(filepath.Join("./frames",
					strconv.Itoa(index)+strconv.FormatInt(img.Index, 10)+
						"-"+strconv.FormatFloat(img.Timestamp, 'f', 6, 64)+".jpg"))
				_, _ = file.Write(img.Data)
				index++
			}
			fmt.Println("视频帧处理结束")
		}
	}()

	go func() {
		_, _ = cons.WriteTo(tr.MultiWriter(pw))
	}()

	tr.OnClose(func() {
		stream.RemoveConsumer(cons)
		_ = pw.Close()
	})

	return nil
}

func handlerWSMP4(tr *ws.Transport, msg *ws.Message) error {
	stream := streams.GetOrPatch(tr.Request.URL.Query())
	if stream == nil {
		return errors.New(api.StreamNotFound)
	}

	var medias []*core.Media
	if codecs := msg.String(); codecs != "" {
		log.Trace().Str("codecs", codecs).Msgf("[mp4] new WS/MP4 consumer")
		medias = mp4.ParseCodecs(codecs, false)
	}

	cons := mp4.NewKeyframe(medias)
	cons.WithRequest(tr.Request)

	if err := stream.AddConsumer(cons); err != nil {
		log.Error().Err(err).Caller().Send()
		return err
	}

	tr.Write(&ws.Message{Type: "mse", Value: mp4.ContentType(cons.Codecs())})

	go cons.WriteTo(tr.Writer())

	tr.OnClose(func() {
		stream.RemoveConsumer(cons)
	})

	return nil
}
