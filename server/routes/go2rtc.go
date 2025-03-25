package routes

import (
	"github.com/gin-gonic/gin"
	"server/middleware"
	"server/settings"
	"server/utils"
)

func go2rtcRoutes(app *gin.RouterGroup) {
	root := app.Group("/", middleware.Validate(settings.TokenPrefix, utils.TokenCheckFn))
	{
		root.GET("/streams", middleware.ProxyToGo2RTC(func(ctx *gin.Context) string {
			return settings.Go2rtcBaseUrl + "/api/streams"
		}, nil))
		root.PUT("/streams", middleware.ProxyToGo2RTC(func(ctx *gin.Context) string {
			return settings.Go2rtcBaseUrl + "/api/streams?src=" + ctx.Query("src") + "&name=" + ctx.Query("name")
		}, nil))
		root.PATCH("/streams", middleware.ProxyToGo2RTC(func(ctx *gin.Context) string {
			return settings.Go2rtcBaseUrl + "/api/streams?src=" + ctx.Query("src") + "&name=" + ctx.Query("name")
		}, nil))
		root.DELETE("/streams", middleware.ProxyToGo2RTC(func(ctx *gin.Context) string {
			return settings.Go2rtcBaseUrl + "/api/streams?src=" + ctx.Query("src")
		}, nil))
	}
}
