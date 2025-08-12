package mp4

import (
	"context"
	"errors"
	"server/go2rtc/internal/api"
	"server/go2rtc/internal/api/ws"
	"server/go2rtc/internal/streams"
	"server/go2rtc/pkg/core"
	"server/go2rtc/pkg/mp4"
	"server/mock"
)

func handlerWSMSE(tr *ws.Transport, msg *ws.Message) error {
	query := tr.Request.URL.Query()
	stream := streams.GetOrPatch(query)
	//streamName := query.Get("src")
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

	//复制MSE流以便处理
	//pr, pw := io.Pipe()
	ctx, cancel := context.WithCancel(context.Background())
	go mock.RecordsMock(query.Get("src"), ctx)
	//go streamServer.HandleStreamWithMSE(pr, query, ctx)
	go func() {
		//_, _ = cons.WriteTo(tr.MultiWriter(pw))
		_, _ = cons.WriteTo(tr.Writer())
	}()

	tr.OnClose(func() {
		stream.RemoveConsumer(cons)
		//_ = pw.Close()
		//_ = pr.Close()
		cancel()
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
