package bubble

import (
	"server/go2rtc/internal/streams"
	"server/go2rtc/pkg/bubble"
	"server/go2rtc/pkg/core"
)

func Init() {
	streams.HandleFunc("bubble", func(source string) (core.Producer, error) {
		return bubble.Dial(source)
	})
}
