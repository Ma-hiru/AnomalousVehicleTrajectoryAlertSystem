package api

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"path/filepath"
	"time"
)

type pemFilePath struct {
	Fullchain string
	Privkey   string
}

var (
	enablePrintStack   = false
	defaultPemFilePath = pemFilePath{
		Fullchain: filepath.Join("./cert/fullchain.pem"),
		Privkey:   filepath.Join("./cert/privkey.pem"),
	}
	errMsg = gin.H{
		"code":    500,
		"message": "服务器错误",
		"ok":      false,
		"data":    nil,
	}
	corsConfig = func(isCors bool) cors.Config {
		return cors.Config{
			AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"},
			AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
			AllowCredentials: true,
			AllowAllOrigins:  isCors,
			MaxAge:           12 * time.Hour,
			AllowOrigins:     []string{},
			ExposeHeaders:    []string{"Content-Length"},
		}
	}
	port       string
	isSSL      bool
	path       pemFilePath
	serverType string
	engine     *gin.Engine
	mode       string
	isCors     bool
)

var Mode = struct {
	ReleaseMode string
	DebugMode   string
	TestMode    string
}{
	ReleaseMode: gin.ReleaseMode,
	DebugMode:   gin.DebugMode,
	TestMode:    gin.TestMode,
}

type Settings struct {
	DefaultPemFilePath pemFilePath
	ErrMsg             map[string]any
	CorsConfig         func(isCors bool) cors.Config
	EnablePrintStack   bool
	Port               string
	SSL                bool
	Chain              string
	Key                string
	Mode               string
	Cors               bool
}

var settings Settings

func InjectSettings(Settings Settings) {
	settings = Settings
}
