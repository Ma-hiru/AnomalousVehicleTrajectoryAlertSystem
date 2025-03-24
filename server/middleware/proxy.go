package middleware

import (
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"server/utils"
)

func ProxyToGo2RTC(ctx *gin.Context) {
	// 1. 构造目标 go2rtc API 地址（假设 go2rtc 运行在 1984 端口）
	targetURL := "http://localhost:3001" + ctx.Request.URL.Path + "?src=" + ctx.Query("src")
	log.Println(targetURL)
	// 2. 创建转发请求
	req, _ := http.NewRequest(ctx.Request.Method, targetURL, ctx.Request.Body)
	req.Header = ctx.Request.Header.Clone()
	// 3. 发送请求并获取响应
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		utils.InternalErrorResponse(ctx)
		return
	}
	defer resp.Body.Close()
	// 4. 将响应透传给客户端
	ctx.DataFromReader(resp.StatusCode, resp.ContentLength, resp.Header.Get("Content-Type"), resp.Body, nil)
}
