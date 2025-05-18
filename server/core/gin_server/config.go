package gin_server

import (
	"errors"
	"github.com/gin-gonic/gin"
	"log"
	"os"
)

func configSSL() {
	if err := getParams(&port, &isSSL, &path, &isCors); err != nil {
		log.Fatalf("SSL Param Error: %v\n", err)
	}
	return
}
func configMode() {
	if mode = *modeFlag; mode != gin.DebugMode && mode != gin.ReleaseMode && mode != gin.TestMode {
		log.Fatalf("GinMode Params Error: %v\n", errors.New("无效的gin模式，有效模式为Debug、Release、test。"))
	}
	return
}
func configSettings() {
	if !hasInjectSettings {
		return
	}
	enablePrintStack = settings.EnablePrintStack
	if settings.DefaultPemFilePath.Fullchain != "" && settings.DefaultPemFilePath.Privkey != "" {
		file, err := os.Open(settings.DefaultPemFilePath.Fullchain)
		if err != nil {
			PrintfWithColor("Open DefaultFullchain err: %v\n", err)
		}
		_ = file.Close()
		file, err = os.Open(settings.DefaultPemFilePath.Privkey)
		if err != nil {
			PrintfWithColor("Open DefaultPrivkey err: %v\n", err)
		}
		_ = file.Close()
		defaultPemFilePath.Fullchain = settings.DefaultPemFilePath.Fullchain
		defaultPemFilePath.Privkey = settings.DefaultPemFilePath.Privkey
	}
	if settings.Chain != "" && settings.Key != "" {
		chain, err := os.Open(settings.Chain)
		defer chain.Close()
		if err != nil {
			PrintfWithColor("Open Fullchain err: %v\n", err)
			return
		}
		key, err := os.Open(settings.Key)
		defer key.Close()
		if err != nil {
			PrintfWithColor("Open Privkey err: %v\n", err)
			return
		}

		path.Fullchain = settings.Chain
		path.Privkey = settings.Key
	}
	if settings.SSL {
		isSSL = true
		serverType = "Https"
	}
	if settings.ErrMsg != nil {
		errMsg = settings.ErrMsg
	}
	if settings.CorsConfig != nil {
		corsConfig = settings.CorsConfig
	}
	if settings.Port != "" {
		port = settings.Port
	}
	if settings.Mode != "" {
		mode = settings.Mode
	}
	if settings.Cors {
		isCors = true
	}
}
func configApp(withUse ...func(engine *gin.Engine)) {
	defer func() {
		if err := recover(); err != nil {
			log.Fatalf("Engine Config Error: %v\n", err)
		}
	}()
	gin.SetMode(mode)
	engine.Use(gin.Logger(), logger, gin.Recovery(), customRecovery(errMsg))
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
