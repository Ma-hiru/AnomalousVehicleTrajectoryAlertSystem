package logger

import (
	"github.com/fatih/color"
	"github.com/gin-gonic/gin"
)

// CustomLogger gin 默认日志格式
// fmt.Sprintf("[GIN] %s | %3d | %13v | %15s | %-7s %s | Agent: %s\n",
//
//	param.TimeStamp.Format("2006/01/02 - 15:04:05"),
//	param.StatusCode,
//	param.Latency,
//	param.ClientIP,
//	param.Method,
//	param.Path,
//	param.Request.UserAgent(),
//
// )
var CustomLogger = gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
	SPrintf := color.New(color.FgMagenta, color.Bold).SprintfFunc()
	return SPrintf("[LOG] %16dbytes |", param.BodySize) + color.New(color.BgYellow, color.FgRed).Sprintf(" %v", param.Keys) + "\n"
})
