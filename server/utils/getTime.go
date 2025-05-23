package utils

import (
	"server/settings"
	"time"
)

func GetFormatTime() string {
	return time.Now().Format(settings.TimeFormat)
}
