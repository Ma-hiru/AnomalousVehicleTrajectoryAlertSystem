package routes

import (
	"github.com/gin-gonic/gin"
	"server/core/gin_server"
)

func UseRoutes(app *gin.Engine) {
	root := app.Group("/api")
	userRoutes(root)
	go2rtcRoutes(root)
	appRoutes(root)
}

func Init() {
	gin_server.WithUse(UseRoutes)
}
