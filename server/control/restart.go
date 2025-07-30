package control

import (
	"os"
	"os/exec"
	"time"
)

func Restart(duration time.Duration, clear []func()) {
	defer func() {
		if err := recover(); err != nil {
			Stop(0)
		}
	}()
	exe, _ := os.Executable()
	cmd := exec.Command(exe, os.Args[1:]...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	<-time.NewTimer(duration).C
	for _, f := range clear {
		f()
	}
	_ = cmd.Start()
	os.Exit(0)
}

func Stop(duration time.Duration) {
	<-time.NewTimer(duration).C
	os.Exit(0)
}
