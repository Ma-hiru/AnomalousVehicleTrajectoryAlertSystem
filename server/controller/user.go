package controller

import (
	"database/sql"
	"github.com/gin-gonic/gin"
	"log"
	"server/middleware"
	"server/model"
	"server/service"
	"server/settings"
	"server/utils"
)

func HandleUserLogin(ctx *gin.Context) {
	params := model.LoginParams{}
	if err := ctx.ShouldBind(&params); err != nil {
		utils.FailResponse(ctx, 201, "表单参数错误！")
		return
	}
	if user, ok := service.GetUser(model.User{
		Username: params.Username,
		Password: params.Password,
	}); !ok {
		utils.FailResponse(ctx, 201, "用户名或密码错误！")
		return
	} else {
		user.Status = sql.Null[int8]{V: 1, Valid: true}
		user.UpdateTime = utils.GetTime(settings.TimeFormat)
		user, ok = service.UpdateUser(*user, *user)
		if !ok {
			log.Println("更新用户状态失败！")
			utils.InternalErrorResponse(ctx)
			return
		}
		token, err := middleware.GenerateToken(utils.StructToJWTMap(model.User{
			Id:       user.Id,
			Username: user.Username,
			Password: user.Password,
		}), settings.TokenExpireDefault)
		if err != nil {
			log.Println("生成Token失败！")
			utils.InternalErrorResponse(ctx)
			return
		}
		utils.SuccessResponse(ctx, "登录成功！", model.LoginResponseData{
			Token:    token,
			Username: user.Username,
			Avatar:   user.Avatar,
		})
		return
	}

}
