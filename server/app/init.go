package app

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func Init(withUse ...func(engine *gin.Engine)) {
	configSSL()
	configMode()
	loggerStartParams()
	configApp(withUse...)
	configRun()
}
func SetCors(set func(config cors.Config) gin.HandlerFunc) {
	engine.Use(set(corsConfig))
}
