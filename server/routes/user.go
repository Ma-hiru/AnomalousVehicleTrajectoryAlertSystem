package routes

import (
	"github.com/gin-gonic/gin"
	"server/controller"
)

func userRoutes(app *gin.RouterGroup) {
	root := app.Group("/user")
	{
		root.POST("/login", controller.HandleUserLogin)
	}
}
