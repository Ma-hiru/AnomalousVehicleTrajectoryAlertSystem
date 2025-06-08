package controller

import (
	"context"
	"database/sql"
	"github.com/gin-gonic/gin"
	"log"
	"server/apiServer/middleware"
	model2 "server/apiServer/model"
	"server/apiServer/service"
	"server/core/redis"
	"server/settings"
	"server/utils"
)

func HandleUserLogin(ctx *gin.Context) {
	params := model2.LoginParams{}
	if err := ctx.ShouldBind(&params); err != nil {
		utils.FailResponse(ctx, 201, "表单参数错误！")
		return
	}
	if user, ok := service.GetUser(model2.User{
		Username: params.Username,
		Password: params.Password,
	}); !ok {
		utils.FailResponse(ctx, 201, "用户名或密码错误！")
		return
	} else {
		user.Status = sql.Null[int8]{V: 1, Valid: true}
		user.UpdateTime = utils.GetFormatTime(settings.TimeFormat)
		user, ok = service.UpdateUser(*user, *user)
		if !ok {
			log.Println("更新用户状态失败！")
			utils.InternalErrorResponse(ctx, settings.ErrMsg)
			return
		}
		token, err := middleware.GenerateToken(utils.StructToJWTMap(
			settings.TokenStruct{
				Id:       user.Id,
				Username: user.Username,
			}), settings.TokenExpireDefault)
		if err != nil {
			log.Println("生成Token失败！")
			utils.InternalErrorResponse(ctx, settings.ErrMsg)
			return
		}
		err = redis.Set(context.Background(), token, user.Id, settings.TokenExpireDefault)
		if err != nil {
			utils.InternalErrorResponse(ctx, settings.ErrMsg)
			log.Println(err)
			return
		}
		utils.SuccessResponse(ctx, "登录成功！", model2.LoginResponseData{
			Token:    token,
			Username: user.Username,
			Avatar:   user.Avatar,
		})
		return
	}

}
