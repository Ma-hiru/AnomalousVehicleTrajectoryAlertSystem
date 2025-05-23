package settings

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"path/filepath"
	"time"
)

type (
	// PemFilePath SSL证书路径格式
	PemFilePath = struct {
		Fullchain string
		Privkey   string
	}
)

var (
	// CorsConfig 跨域设置
	CorsConfig = func(isCors bool) cors.Config {
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

	// DefaultPemFilePath 默认SSL证书路径
	DefaultPemFilePath = PemFilePath{
		Fullchain: filepath.Join("./cert/fullchain.pem"),
		Privkey:   filepath.Join("./cert/privkey.pem"),
	}

	// ErrMsg 500错误信息
	ErrMsg = gin.H{
		"code":    500,
		"message": "服务器错误",
		"ok":      false,
		"data":    nil,
	}
)
