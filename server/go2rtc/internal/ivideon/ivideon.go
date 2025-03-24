package ivideon

import (
	"server/go2rtc/internal/streams"
	"server/go2rtc/pkg/core"
	"server/go2rtc/pkg/ivideon"
)

func Init() {
	streams.HandleFunc("ivideon", func(source string) (core.Producer, error) {
		return ivideon.Dial(source)
	})
}
