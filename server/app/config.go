package app

import (
	"github.com/gin-gonic/gin"
	"server/middleware"
	"server/routes"
	"server/settings"
	"server/static"
)

func ConfigApp(app *gin.Engine) {
	app.Use(middleware.CustomRecovery(settings.ErrMsg))
	app.Use(middleware.Cors(settings.CorsConfig))
	routes.UseRoutes(app)
	static.UseStatic(app)
}
