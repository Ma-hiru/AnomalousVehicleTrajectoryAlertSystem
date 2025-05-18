package gin_server

import (
	"github.com/fatih/color"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"path/filepath"
	"time"
)

type pemFilePath struct {
	Fullchain string
	Privkey   string
}
type apiMode struct {
	ReleaseMode string
	DebugMode   string
	TestMode    string
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

var (
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
	enablePrintStack = false
	port             string
	isSSL            bool
	path             pemFilePath
	mode             string
	isCors           bool
)
var (
	hasInjectSettings bool
	settings          Settings
	serverType        string

	Mode = apiMode{
		ReleaseMode: gin.ReleaseMode,
		DebugMode:   gin.DebugMode,
		TestMode:    gin.TestMode,
	}
	engine           = gin.New()
	PrintlnWithColor = color.New(color.BgHiBlue).PrintlnFunc()
	PrintfWithColor  = color.New(color.BgHiBlue).PrintfFunc()
)

func InjectSettings(Settings Settings) {
	settings = Settings
	hasInjectSettings = true
}
