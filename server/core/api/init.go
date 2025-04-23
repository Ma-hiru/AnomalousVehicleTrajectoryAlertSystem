package api

import (
	"github.com/gin-gonic/gin"
)

func Init(withUse ...func(engine *gin.Engine)) {
	configSSL()
	configMode()
	configSettings()
	loggerStartParams()
	configApp(withUse...)
	configRun()
}

func GetApp() *gin.Engine {
	return engine
}
