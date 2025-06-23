package main

import (
	"server/control"
	yolov8 "server/core/yolo_grpc"
	"server/debug"
	"server/test"
	"sync"
)

func main() {
	wg := &sync.WaitGroup{}
	control.WrapWg(wg, map[string]func(){
		"pprof":          debug.PProf,
		"listenSignExit": debug.ListenSignExit,
		//"streamServer.SimulateStream": streamServer.SimulateStream,
		//"go2rtc":    go2rtc.Init,
		"yolo": yolov8.Init,
		//"redis":     redis.Init,
		//"apiServer": apiServer.Init,
		"testYolo": test.YoloSimulate,
	})
	wg.Wait()
}
