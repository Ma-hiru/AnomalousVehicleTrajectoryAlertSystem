package routes

import (
	"github.com/gin-gonic/gin"
	"server/middleware"
)

func go2rtcRoutes(app *gin.RouterGroup) {
	app.GET("/stream.mp4", middleware.ProxyToGo2RTC)
}
