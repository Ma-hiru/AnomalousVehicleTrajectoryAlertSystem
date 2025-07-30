package routes

import (
	"github.com/gin-gonic/gin"
	"server/apiServer/controller"
)

func appRoutes(app *gin.RouterGroup, version Version) {
	if version == V1 {
		app.GET("/v1/restart", controller.AppRestart)
		app.GET("/v1/stop", controller.AppStop)
	}
}
