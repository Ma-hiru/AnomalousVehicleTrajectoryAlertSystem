package main

import (
	"server/apiServer"
	"server/control"
	"server/core/redis"
	yolov8 "server/core/yolo_grpc"
	"server/debug"
	"server/go2rtc"
	"server/streamServer"
	"sync"
)

func main() {
	wg := &sync.WaitGroup{}
	control.WrapWg(wg, map[string]func(){
		//"pprof":          debug.PProf,
		"listenSignExit": debug.ListenSignExit,
		"simulateStream": streamServer.SimulateServer,
		"go2rtc":         go2rtc.Init,
		"yolo_init":      yolov8.Init,
		"redis_init":     redis.Init,
		"apiServer":      apiServer.Init,
		//"testYolo":  test.YoloSimulate,
	})
	wg.Wait()
}
