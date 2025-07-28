package routes

import (
	"github.com/gin-gonic/gin"
	"server/apiServer/controller"
)

func trackRoutes(app *gin.RouterGroup, version Version) {
	if version == V1 {
		app.GET("/v1/tracks", controller.GetTrackList)
	}
}
