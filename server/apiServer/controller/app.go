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

func UpdateYaml(ctx *gin.Context) {
	var params struct {
		Content string `json:"content" binding:"required"`
	}
	utils.Logger("UpdateYaml").Println(ctx.Param("content"))
	if err := ctx.ShouldBindJSON(&params); err != nil {
		utils.FailResponse(ctx, 201, "参数错误")
		return
	}
	if err := utils.UpdateYaml(params.Content); err != nil {
		utils.FailResponse(ctx, 201, "更新配置失败: "+err.Error())
		return
	}
	utils.SuccessResponse(ctx, "更新配置成功", nil)
}
