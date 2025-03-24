package routes

import "github.com/gin-gonic/gin"

func UseRoutes(app *gin.Engine) {
	root := app.Group("/api")
	userRoutes(root)
	go2rtcRoutes(root)
}
