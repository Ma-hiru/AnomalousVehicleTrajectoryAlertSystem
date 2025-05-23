package main

import (
	"os"
	"os/signal"
	"server/apiServer"
	"server/control"
	"server/go2rtc"
	"server/streamServer"
	"server/utils"
	"syscall"
)

var errMsg = make(chan error)

func stream() {
	go2rtcRoutine := control.NewRoutine("go2rtc", go2rtc.Run)
	go2rtcControl, _ := control.NewControl(
		"go2rtc_control",
		[]*control.Routine{go2rtcRoutine},
		&control.Config{RestartOnErr: false},
	)
	go go2rtcControl.Go()
}
func main() {
	go streamServer.SimulateStream(errMsg)
	go stream()
	go apiServer.Init(errMsg)
	go func() {
		for {
			sigs := make(chan os.Signal, 1)
			signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)
			println("exit with signal:", (<-sigs).String())
			os.Exit(0)
		}
	}()
	for {
		select {
		case err, _ := <-errMsg:
			utils.Logger().Println(err)
			return
		}
	}

}
