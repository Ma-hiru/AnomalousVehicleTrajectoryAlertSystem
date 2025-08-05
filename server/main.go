package main

import (
	"server/apiServer"
	"server/control"
	"server/core/redis"
	"server/debug"
	"server/go2rtc"
	"sync"
)

func main() {
	wg := &sync.WaitGroup{}
	control.WrapWg(wg, map[string]func(){
		//"pprof":          debug.PProf,
		"listenSignExit": debug.ListenSignExit,
		//"simulateStream": streamServer.SimulateStream,
		"go2rtc": go2rtc.Init,
		//"yolo":      yolov8.Init,
		"redis":     redis.Init,
		"apiServer": apiServer.Init,
		//"testYolo":  test.YoloSimulate,
	})
	wg.Wait()
}
