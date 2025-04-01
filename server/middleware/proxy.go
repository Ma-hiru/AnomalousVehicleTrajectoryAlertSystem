package middleware

import (
	"github.com/gin-gonic/gin"
	"io"
	"net/http"
	"server/utils"
)

func ProxyToGo2RTC(constructURL func(ctx *gin.Context) string, extraHeaders map[string]string, handleRes func(ctx *gin.Context, resp *http.Response)) func(ctx *gin.Context) {
	return func(ctx *gin.Context) {
		req, _ := http.NewRequest(ctx.Request.Method, constructURL(ctx), ctx.Request.Body)
		req.Header = ctx.Request.Header.Clone()
		resp, err := (&http.Client{}).Do(req)
		if err != nil {
			utils.InternalErrorResponse(ctx)
			return
		}
		defer func(Body io.ReadCloser) {
			_ = Body.Close()
		}(resp.Body)
		if handleRes != nil {
			handleRes(ctx, resp)
		} else {
			ctx.DataFromReader(resp.StatusCode, resp.ContentLength, resp.Header.Get("Content-Type"), resp.Body, extraHeaders)
		}
	}
}
