package utils

import (
	"context"
	"time"
)

func setTimeout(callback func(), delay time.Duration) context.CancelFunc {
	ctx, cancel := context.WithCancel(context.Background())
	go func() {
		timer := time.NewTimer(delay)
		defer timer.Stop()
		defer func() {
			if err := recover(); err != nil {
				Logger("setInterval").Println(err)
			}
		}()
		select {
		case <-timer.C:
			callback()
		case <-ctx.Done():
			return
		}
	}()
	return cancel
}

func setInterval(callback func(), delay time.Duration) context.CancelFunc {
	ctx, cancel := context.WithCancel(context.Background())
	go func() {
		ticker := time.NewTicker(delay)
		defer ticker.Stop()
		defer func() {
			if err := recover(); err != nil {
				Logger("setInterval").Println(err)
			}
		}()
		for {
			select {
			case <-ticker.C:
				callback()
			case <-ctx.Done():
				return
			}
		}
	}()
	return cancel
}
