package utils

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

type Response struct {
	Code    int    `json:"code"`
	Ok      bool   `json:"ok"`
	Message string `json:"message"`
	Data    any    `json:"data,omitempty"`
}

func CustomResponse(ctx *gin.Context, res *Response) {
	ctx.JSON(http.StatusOK, res)
}

func SuccessResponse(ctx *gin.Context, message string, data any) {
	ctx.JSON(http.StatusOK, Response{
		Code:    http.StatusOK,
		Message: message,
		Ok:      true,
		Data:    data,
	})
}
func FailResponse(ctx *gin.Context, code int, message string) {
	ctx.JSON(http.StatusOK, Response{
		Code:    code,
		Message: message,
		Ok:      false,
	})
}
func InternalErrorResponse(ctx *gin.Context, ErrMsg gin.H) {
	ctx.JSON(http.StatusInternalServerError, ErrMsg)
}
func UnauthorizedResponse(ctx *gin.Context) {
	ctx.JSON(http.StatusUnauthorized, Response{
		Code:    http.StatusUnauthorized,
		Message: "身份认证失败，请重新登录！",
		Ok:      false,
	})
}
func NotFoundResponse(ctx *gin.Context) {
	ctx.JSON(http.StatusNotFound, Response{
		Code:    http.StatusNotFound,
		Message: "404 NotFound",
		Ok:      false,
	})
}
