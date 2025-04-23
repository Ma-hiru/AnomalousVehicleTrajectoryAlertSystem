package main

import (
	"log"
	"server/controller"
	"server/core/api"
	"server/go2rtc"
	"server/routes"
	"server/settings"
	"server/static"
)

func APIServer() {
	api.InjectSettings(api.Settings{
		DefaultPemFilePath: settings.DefaultPemFilePath,
		ErrMsg:             settings.ErrMsg,
		CorsConfig:         settings.CorsConfig,
		EnablePrintStack:   false,
		Mode:               api.Mode.ReleaseMode,
	})
	api.Init(routes.UseRoutes, static.UseStatic)
}
func StreamServer(errMsg chan<- error) {
	go controller.SimulateStream(errMsg)
	go2rtc.Run(errMsg)
}
func main() {
	//ctx := context.Background()
	errMsg := make(chan error)
	go APIServer()
	go StreamServer(errMsg)
	log.Println(<-errMsg)
}
