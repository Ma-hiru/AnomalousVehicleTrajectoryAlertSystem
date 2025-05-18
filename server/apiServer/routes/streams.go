package routes

import "github.com/gin-gonic/gin"

func streamsRoutes(app *gin.RouterGroup) {
	root := app.Group("/")
	{
		root.GET("/streams/:name")
		root.PATCH("/streams/:name")
	}
}
