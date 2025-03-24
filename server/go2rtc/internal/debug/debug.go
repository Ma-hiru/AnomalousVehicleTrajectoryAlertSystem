package debug

import (
	"server/go2rtc/internal/api"
)

func Init() {
	api.HandleFunc("api/stack", stackHandler)
}
