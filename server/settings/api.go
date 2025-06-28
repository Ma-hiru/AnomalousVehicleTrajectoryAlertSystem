package settings

import (
	"github.com/gin-gonic/gin"
)

var (
	// ErrMsg 500错误信息
	ErrMsg = gin.H{
		"code":    500,
		"message": "服务器错误",
		"ok":      false,
		"data":    nil,
	}
)
