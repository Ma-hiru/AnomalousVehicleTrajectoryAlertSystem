package apiServer

import (
	"server/apiServer/routes"
	"server/apiServer/static"
	"server/settings"
	"server/socketServer"
	"shiina-mahiru.cn/gin_server"
	"shiina-mahiru.cn/gin_server/pkg/conf"
	"shiina-mahiru.cn/gin_server/pkg/logger"
)

func Init() {
	routes.Init()
	static.Init()
	socketServer.FramesSocketInit()
	err := gin_server.InitWithInject(
		conf.Options{InternalErrMsg: settings.ErrMsg},
		settings.AppName,
		settings.AppVersion,
	)
	if err != nil {
		logger.New("GIN").Panic(err.Error())
	}
}
