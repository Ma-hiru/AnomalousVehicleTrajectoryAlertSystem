package functional

import (
	"context"
	"fmt"
	"time"
)

func SetTimeout(callback func(cancel context.CancelFunc), delay time.Duration) context.CancelFunc {
	ctx, cancel := context.WithCancel(context.Background())
	go func() {
		timer := time.NewTimer(delay)
		defer timer.Stop()
		defer func() {
			if err := recover(); err != nil {
				fmt.Println("setInterval", err)
			}
		}()
		select {
		case <-timer.C:
			callback(cancel)
		case <-ctx.Done():
			return
		}
	}()
	return cancel
}

func SetInterval(callback func(cancel context.CancelFunc), delay time.Duration) context.CancelFunc {
	ctx, cancel := context.WithCancel(context.Background())
	go func() {
		ticker := time.NewTicker(delay)
		defer ticker.Stop()
		defer func() {
			if err := recover(); err != nil {
				fmt.Println("setInterval", err)
			}
		}()
		for {
			select {
			case <-ticker.C:
				callback(cancel)
			case <-ctx.Done():
				return
			}
		}
	}()
	return cancel
}
