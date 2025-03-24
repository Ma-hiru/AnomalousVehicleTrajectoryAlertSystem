package tapo

import (
	"server/go2rtc/internal/streams"
	"server/go2rtc/pkg/core"
	"server/go2rtc/pkg/kasa"
	"server/go2rtc/pkg/tapo"
)

func Init() {
	streams.HandleFunc("kasa", func(source string) (core.Producer, error) {
		return kasa.Dial(source)
	})

	streams.HandleFunc("tapo", func(source string) (core.Producer, error) {
		return tapo.Dial(source)
	})

	streams.HandleFunc("vigi", func(source string) (core.Producer, error) {
		return tapo.Dial(source)
	})
}
