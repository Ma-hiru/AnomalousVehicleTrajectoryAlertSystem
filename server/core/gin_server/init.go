package gin_server

import (
	"github.com/gin-gonic/gin"
)

var withUse []func(engine *gin.Engine)

func Init() {
	configSSL()
	configMode()
	configSettings()
	loggerStartParams()
	configApp(withUse...)
	configRun()
}
func InitWithUse(use ...func(engine *gin.Engine)) {
	WithUse(use...)
	configSSL()
	configMode()
	configSettings()
	loggerStartParams()
	configApp(withUse...)
	configRun()
}
func InitWithInject(settings Settings) {
	InjectSettings(settings)
	configSSL()
	configMode()
	configSettings()
	loggerStartParams()
	configApp(withUse...)
	configRun()
}
func WithUse(use ...func(engine *gin.Engine)) {
	withUse = append(withUse, use...)
}
func GetEngine() *gin.Engine {
	return engine
}
