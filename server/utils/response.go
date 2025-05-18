package utils

import (
	"net/http"
	"server/apiServer/model"
	"server/settings"

	"github.com/gin-gonic/gin"
)

func SuccessResponse(ctx *gin.Context, message string, data any) {
	ctx.JSON(http.StatusOK, model.Response{
		Code:    http.StatusOK,
		Message: message,
		Ok:      true,
		Data:    data,
	})
}
func FailResponse(ctx *gin.Context, code int, message string) {
	ctx.JSON(http.StatusOK, model.Response{
		Code:    code,
		Message: message,
		Ok:      false,
	})
}
func InternalErrorResponse(ctx *gin.Context) {
	ctx.JSON(http.StatusInternalServerError, settings.ErrMsg)
}
func UnauthorizedResponse(ctx *gin.Context) {
	ctx.JSON(http.StatusUnauthorized, model.Response{
		Code:    http.StatusUnauthorized,
		Message: "身份认证失败，请重新登录！",
		Ok:      false,
	})
}
func NotFoundResponse(ctx *gin.Context) {
	ctx.JSON(http.StatusNotFound, model.Response{
		Code:    http.StatusNotFound,
		Message: "404 NotFound",
		Ok:      false,
	})
}
