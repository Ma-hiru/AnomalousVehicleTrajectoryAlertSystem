package controller

import (
	"database/sql"
	"github.com/gin-gonic/gin"
	"server/apiServer/model"
	"server/apiServer/service"
	"server/core/functional"
	"server/utils"
)

// GetActions 获取行为枚举 query: actionId | actionName | null
func GetActions(ctx *gin.Context) {
	var (
		resultArr    []*model.Actions
		actionName   = ctx.Query("actionName")
		actionId, ok = utils.ParseInt(ctx.Query("actionId"))
	)
	if actionName == "" && !ok {
		resultArr, _ = service.GetActions(nil)
	} else {
		resultArr, _ = service.GetActions(&model.Actions{
			ActionId:   sql.Null[int8]{V: int8(actionId), Valid: ok},
			ActionName: actionName,
		})
	}
	jsonArr := functional.SliceReduce(
		resultArr,
		func(
			pre []*model.ActionsLayout,
			curValue *model.Actions,
			curIndex int,
		) []*model.ActionsLayout {
			newData := &model.ActionsLayout{
				ActionName: curValue.ActionName,
			}
			if curValue.ActionId.Valid {
				newData.ActionId = curValue.ActionId.V
			} else {
				newData.ActionId = -1
			}
			pre = append(pre, newData)
			return pre
		},
		[]*model.ActionsLayout{},
	)
	utils.SuccessResponse(ctx, "查询成功", jsonArr)
}
