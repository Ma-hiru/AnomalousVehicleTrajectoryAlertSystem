package controller

import (
	"github.com/gin-gonic/gin"
	"server/apiServer/model"
	"server/apiServer/service"
	"server/core/functional"
	"server/utils"
)

// GetRecords 获取行为记录 query: streamId | streamName | startTime endTime | null
func GetRecords(ctx *gin.Context) {
	var (
		streamId     = ctx.Query("streamId")
		streamName   = ctx.Query("streamName")
		startTime, _ = utils.ParseInt(ctx.Query("startTime"))
		endTime, _   = utils.ParseInt(ctx.Query("endTime"))
		resultArr    []*model.Records
	)
	if (streamId != "" || streamName != "") && startTime != 0 && endTime != 0 {
		resultArr, _ = service.GetRecord("streamId = ? or streamName = ? and time >= ? and time <= ?", streamId, streamName, startTime, endTime)
	} else if startTime != 0 && endTime != 0 {
		resultArr, _ = service.GetRecord("time >= ? and time <= ?", startTime, endTime)
	} else if streamId != "" || streamName != "" {
		resultArr, _ = service.GetRecord("streamId = ? or streamName = ?", streamId, streamName)
	} else {
		resultArr, _ = service.GetRecord()
	}
	jsonArr := functional.SliceReduce(
		resultArr,
		func(pre []*model.RecordsLayout, curValue *model.Records, curIndex int) []*model.RecordsLayout {
			newData := &model.RecordsLayout{
				RecordId: curValue.RecordId,
				CarId:    curValue.CarId,
				Time:     curValue.Time,
			}
			if curValue.StreamId.Valid {
				newData.StreamId = curValue.StreamId.V
			}
			if curValue.ActionId.Valid {
				newData.ActionId = curValue.ActionId.V
			}
			pre = append(pre, newData)
			return pre
		},
		[]*model.RecordsLayout{},
	)
	utils.SuccessResponse(ctx, "查询成功", jsonArr)
}
