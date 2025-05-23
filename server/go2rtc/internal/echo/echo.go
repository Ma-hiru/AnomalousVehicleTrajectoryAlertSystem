package echo

import (
	"bytes"
	"os/exec"

	"server/go2rtc/internal/app"
	"server/go2rtc/internal/streams"
	"server/go2rtc/pkg/shell"
)

func Init() {
	log := app.GetLogger("echo")

	streams.RedirectFunc("echo", func(url string) (string, error) {
		args := shell.QuoteSplit(url[5:])

		b, err := exec.Command(args[0], args[1:]...).Output()
		if err != nil {
			return "", err
		}

		b = bytes.TrimSpace(b)

		log.Debug().Str("url", url).Msgf("[echo] %s", b)

		return string(b), nil
	})
}
