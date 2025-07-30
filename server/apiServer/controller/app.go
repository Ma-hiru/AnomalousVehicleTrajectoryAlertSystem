package controller

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"server/control"
	"server/utils"
	"time"
)

func AppRestart(ctx *gin.Context) {
	duration, ok := utils.ParseInt(ctx.Query("duration"))
	if !ok {
		utils.FailResponse(ctx, 201, "duration参数错误")
		return
	}
	utils.SuccessResponse(
		ctx,
		fmt.Sprintf("app will restart in %vs", duration),
		gin.H{"restart": true},
	)
	go control.Restart(time.Second*time.Duration(duration), nil)
}

func AppStop(ctx *gin.Context) {
	duration, ok := utils.ParseInt(ctx.Query("duration"))
	if !ok {
		utils.FailResponse(ctx, 201, "duration参数错误")
		return
	}
	utils.SuccessResponse(
		ctx,
		fmt.Sprintf("app will stop in %vs", duration),
		gin.H{"stop": true},
	)
	go control.Stop(time.Second * time.Duration(duration))
}
