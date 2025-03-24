package app

import (
	"github.com/gin-gonic/gin"
	"log"
	"server/settings"
)

var port string
var isSSL bool
var path settings.PemFilePath
var err error

func StartConfig(configFn func() (port string, ok bool, path settings.PemFilePath, err error)) {
	port, isSSL, path, err = configFn()
	if err != nil {
		log.Fatalf("Start Param Error: %v\n", err)
	}
	if mode, err := settings.GinMode(); err != nil {
		log.Fatalf("GinMode Error: %v\n", err)
	} else {
		gin.SetMode(mode)
	}
	settings.LoggerStartParams()
}
