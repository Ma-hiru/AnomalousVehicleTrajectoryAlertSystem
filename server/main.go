package main

import (
	"github.com/fatih/color"
	_ "net/http/pprof"
	"server/apiServer"
	"server/control"
	"server/debug"
	"server/go2rtc"
	"server/streamServer"
	"server/utils"
	"sync"
)

var wg sync.WaitGroup

func go2rtcServer() {
	go2rtcRoutine := control.NewRoutine("go2rtc", go2rtc.Run)
	go2rtcControl, _ := control.NewControl(
		"go2rtc_control",
		[]*control.Routine{go2rtcRoutine},
		&control.Config{RestartOnErr: false},
	)
	go go2rtcControl.Go()
}
func main() {
	WrapWg(&wg, func() {
		debug.PProf(":6060", "")
	})
	WrapWg(&wg, debug.ListenSignExit)
	WrapWg(&wg, streamServer.SimulateStream)
	WrapWg(&wg, go2rtcServer)
	WrapWg(&wg, apiServer.Init)
	wg.Wait()
}
func WrapWg(wg *sync.WaitGroup, goroutine func()) {
	wg.Add(1)
	go func() {
		defer func() {
			if err := recover(); err != nil {
				utils.Logger("MAIN").SetColor(color.FgRed).Printf("Get panic: %v", err)
			}
			wg.Done()
		}()
		goroutine()
	}()
}
