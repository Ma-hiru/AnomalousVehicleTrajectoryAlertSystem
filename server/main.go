package main

import (
	"errors"
	"fmt"
	"server/controller"
	"server/core/api"
	"server/go2rtc"
	"server/routes"
	"server/settings"
	"server/static"
	"server/utils"
)

func APIServer(errMsg chan<- error) {
	defer func() {
		if r := recover(); r != nil {
			var err error
			switch v := r.(type) {
			case string:
				err = errors.New(v)
			case error:
				err = v
			default:
				err = fmt.Errorf("panic %v", v)
			}
			errMsg <- err
		}
	}()
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
	go APIServer(errMsg)
	go StreamServer(errMsg)
	utils.Logger().Println(<-errMsg)
}
