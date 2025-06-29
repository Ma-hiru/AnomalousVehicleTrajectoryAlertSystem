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
		// 获取视频列表 query: streamId | streamName | null
		app.GET("/v1/Videos", controller.GetVideos)
		// 更新视频列表 param: streamId streamName? addr? latitude? longitude?
		app.PATCH("/v1/Videos", controller.PatchVideos)
		// 添加视频流信息 param: streamName addr? latitude longitude
		app.POST("/v1/Videos", controller.AddVideos)
		// 删除视频流信息 query: streamId | streamName
		app.DELETE("/v1/Videos", controller.DelVideos)
	}
}
func managerActions(app *gin.RouterGroup, version Version) {
	if version == V1 {
		// 获取行为枚举 query: actionId | actionName | null
		app.GET("/v1/Actions", controller.GetActions)
	}
}
func managerRecords(app *gin.RouterGroup, version Version) {
	if version == V1 {
		// 获取行为记录 query: streamId | streamName | startTime endTime | null
		app.GET("/v1/Records", controller.GetRecords)
	}
}
func managerCategory(app *gin.RouterGroup, version Version) {
	if version == V1 {
		// 获取行为分类统计 query: streamId | streamName | from to | null
		app.GET("/v1/Category", controller.GetCategory)
		// 按分钟获取行为分类统计 query: streamId | streamName | from to | null
		app.GET("/v1/Category/minute", controller.GetCategoryMinute)
	}
}
