package routes

import (
	"github.com/gin-gonic/gin"
	"server/apiServer/middleware"
	"server/settings"
)

func go2rtcRoutes(app *gin.RouterGroup, version Version) {
	if version == V1 {
		//, middleware.Validate(settings.TokenPrefix, utils.TokenCheckFn)
		root := app.Group("/v1/proxy")
		{
			root.GET("/config", middleware.ProxyToGo2RTC(func(ctx *gin.Context) string {
				return settings.Go2rtcBaseUrl + "/api/config"
			}, nil, nil))
			root.PATCH("/config", middleware.ProxyToGo2RTC(func(ctx *gin.Context) string {
				return settings.Go2rtcBaseUrl + "/api/config"
			}, nil, nil))
			root.GET("/streams", middleware.ProxyToGo2RTC(func(ctx *gin.Context) string {
				return settings.Go2rtcBaseUrl + "/api/streams"
			}, nil, nil))
			root.PUT("/streams", middleware.ProxyToGo2RTC(func(ctx *gin.Context) string {
				return settings.Go2rtcBaseUrl + "/api/streams?src=" + ctx.Query("src") + "&name=" + ctx.Query("name")
			}, nil, nil))
			root.PATCH("/streams", middleware.ProxyToGo2RTC(func(ctx *gin.Context) string {
				return settings.Go2rtcBaseUrl + "/api/streams?src=" + ctx.Query("src") + "&name=" + ctx.Query("name")
			}, nil, nil))
			root.DELETE("/streams", middleware.ProxyToGo2RTC(func(ctx *gin.Context) string {
				return settings.Go2rtcBaseUrl + "/api/streams?src=" + ctx.Query("src")
			}, nil, nil))
			root.POST("/restart", middleware.ProxyToGo2RTC(func(ctx *gin.Context) string {
				return settings.Go2rtcBaseUrl + "/api/restart"
			}, nil, nil))
		}
	}
}
