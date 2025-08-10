package utils

import (
	"github.com/gin-gonic/gin"
	"server/core/enum"
)

func ShouldBind[T any](ctx *gin.Context, obj T) *enum.Result[*T] {
	var params = &obj
	if err := ctx.ShouldBind(params); err != nil {
		return enum.Err[*T](err)
	}
	return enum.Ok(params)
}
