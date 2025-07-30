package routes

import (
	"github.com/gin-gonic/gin"
	"server/apiServer/controller"
)

func carRoutes(app *gin.RouterGroup, version Version) {
	managerVideos(app, version)
	managerRecords(app, version)
	managerActions(app, version)
	managerCategory(app, version)
}
func managerVideos(app *gin.RouterGroup, version Version) {
	if version == V1 {
		// 获取视频列表 query: streamId or streamName(like) | null(all)
		app.GET("/v1/videos", controller.GetVideos)
		// 更新视频列表 param: streamId streamName? addr? latitude? longitude?
		app.PATCH("/v1/videos", controller.PatchVideos)
		// 添加视频流信息 param: streamName addr? latitude longitude
		app.POST("/v1/videos", controller.AddVideos)
		// 删除视频流信息 query: streamId | streamName
		app.DELETE("/v1/videos", controller.DelVideos)
		// 更新视频列表 param: {streamId streamName? addr? latitude? longitude?}[]
		app.POST("/v1/videos/settings", controller.SettingsVideos)
	}
}
func managerActions(app *gin.RouterGroup, version Version) {
	if version == V1 {
		// 获取行为枚举 query: actionId or actionName | null
		app.GET("/v1/actions", controller.GetActions)
	}
}
func managerRecords(app *gin.RouterGroup, version Version) {
	if version == V1 {
		// 获取行为记录 query: (streamId or streamName) & from & to | null
		app.GET("/v1/records", controller.GetRecords)
	}
}
func managerCategory(app *gin.RouterGroup, version Version) {
	if version == V1 {
		// 获取行为分类统计 query: (streamId or streamName) & from & to | null(all)
		app.GET("/v1/category", controller.GetCategory)
		// 按分钟获取行为分类统计 query: (streamId or streamName or null) & from & to & gap(Minute)
		app.GET("/v1/category/minute", controller.GetCategoryMinute)
	}
}
