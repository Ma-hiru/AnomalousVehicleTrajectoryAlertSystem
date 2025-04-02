package app

import (
	"errors"
	"github.com/gin-gonic/gin"
	"log"
)

var (
	port       string
	isSSL      bool
	path       pemFilePath
	serverType string
	engine     *gin.Engine
	mode       string
)

func configSSL() {
	if err := getParams(&port, &isSSL, &path); err != nil {
		log.Fatalf("SSL Param Error: %v\n", err)
	}
	return
}
func configMode() {
	if mode = *modeFlag; mode != gin.DebugMode && mode != gin.ReleaseMode && mode != gin.TestMode {
		log.Fatalf("GinMode Params Error: %v\n", errors.New("无效的gin模式，有效模式为Debug、Release、test。"))
	} else {
		gin.SetMode(mode)
	}
	return
}
func configApp(withUse ...func(engine *gin.Engine)) {
	defer func() {
		if err := recover(); err != nil {
			log.Fatalf("Engine Config Error: %v\n", err)
		}
	}()
	engine = gin.New(func(engine *gin.Engine) {
		engine.Use(gin.Logger(), gin.Recovery(), customRecovery(errMsg))
	})
	setCors()
	for _, fn := range withUse {
		fn(engine)
	}
}
func configRun() {
	var err error
	if isSSL {
		serverType = "Https"
		err = engine.RunTLS(port, path.Fullchain, path.Privkey)
	} else {
		serverType = "Http"
		err = engine.Run(port)
	}
	if err != nil {
		log.Fatalf("%s Server start fail at %s.Reason: %v", serverType, port, err)
	}
}
