package apiServer

import (
	"errors"
	"fmt"
	"server/apiServer/routes"
	"server/apiServer/static"
	"server/core/gin_server"
	"server/settings"
)

func Init(errMsg chan<- error) {
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
	routes.Init()
	static.Init()
	gin_server.InitWithInject(gin_server.Settings{
		DefaultPemFilePath: settings.DefaultPemFilePath,
		ErrMsg:             settings.ErrMsg,
		CorsConfig:         settings.CorsConfig,
		EnablePrintStack:   false,
		Mode:               gin_server.Mode.DebugMode,
	})
}
