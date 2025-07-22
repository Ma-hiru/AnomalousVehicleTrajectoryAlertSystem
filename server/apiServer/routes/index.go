package routes

import (
	"github.com/gin-gonic/gin"
	"shiina-mahiru.cn/gin_server"
)

type Version int8

const (
	V1 Version = iota
)

func useRoutes(app *gin.Engine) {
	root := app.Group("/api")
	{
		go2rtcRoutes(root, V1)
		appRoutes(root, V1)
		carRoutes(root, V1)
	}
}

func Init() {
	gin_server.WithUse(useRoutes)
}
