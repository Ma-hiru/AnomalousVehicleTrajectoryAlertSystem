package main

import (
	"server/apiServer"
	"server/control"
	"server/debug"
	"sync"
)

func main() {
	wg := &sync.WaitGroup{}
	control.WrapWg(wg, map[string]func(){
		//"debug.PProf":          debug.PProf,
		"debug.ListenSignExit": debug.ListenSignExit,
		//"streamServer.SimulateStream": streamServer.SimulateStream,
		//"go2rtc.Init":    go2rtc.Init,
		"apiServer.Init": apiServer.Init,
	})
	wg.Wait()
}
