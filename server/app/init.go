package app

import (
	"github.com/gin-gonic/gin"
)

func Init(withUse ...func(engine *gin.Engine)) {
	configSSL()
	configMode()
	loggerStartParams()
	configApp(withUse...)
	configRun()
}
