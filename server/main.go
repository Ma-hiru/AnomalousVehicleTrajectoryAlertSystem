package main

import (
	"server/apiServer"
	"server/go2rtc"
	"server/socketServer"
	"server/streamServer"
	"server/utils"
)

func main() {
	errMsg := make(chan error)
	go socketServer.FramesSocketInit()
	go apiServer.Init(errMsg)
	go streamServer.SimulateStream(errMsg)
	go go2rtc.Run(errMsg)
	utils.Logger().Println(<-errMsg)
}
