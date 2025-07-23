package controller

import (
	"context"
	"github.com/gin-gonic/gin"
	"server/apiServer/model"
	"server/apiServer/service"
	"server/core/functional"
	"server/utils"
)

// GetActions 获取行为枚举 query: actionId or actionName | null
func GetActions(ctx *gin.Context) {
	var (
		resultArr    []*model.Action
		actionName   = ctx.Query("actionName")
		actionId, ok = utils.ParseInt(ctx.Query("actionId"))
	)
	if actionName == "" && !ok {
		resultArr, _ = service.Action.WithContext(context.Background()).Find()
	} else {
		resultArr, _ = service.Action.WithContext(context.Background()).
			Where(service.Action.ActionID.Eq(int64(actionId))).
			Or(service.Action.ActionName.Eq(actionName)).
			Find()
	}
	utils.SuccessResponse(ctx, "查询成功", resultArr)
}

func getActions() (resultArr []*model.Action) {
	resultArr, _ = service.Action.WithContext(context.Background()).Find()
	return
}

func getActionsMaxId() int64 {
	return functional.SliceReduce(
		getActions(),
		func(pre int64, curValue *model.Action, curIndex int) int64 {
			if curValue.ActionID > pre {
				pre = curValue.ActionID
			}
			return pre
		},
		-1,
	)
}
