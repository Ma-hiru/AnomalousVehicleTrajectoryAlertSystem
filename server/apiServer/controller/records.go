package controller

import (
	"context"
	"github.com/gin-gonic/gin"
	"gorm.io/gen"
	"server/apiServer/model"
	"server/apiServer/service"
	"server/core/functional"
	"server/core/redis"
	"server/utils"
	"shiina-mahiru.cn/gin_server/pkg/logger"
	"time"
)

type RecordsWithStatus struct {
	RecordID string `gorm:"column:recordId;primaryKey" json:"recordId"`
	CarID    string `gorm:"column:carId;not null" json:"carId"`
	StreamID int32  `gorm:"column:streamId;not null" json:"streamId"`
	ActionID int64  `gorm:"column:actionId" json:"actionId"`
	Time     int64  `gorm:"column:time;not null" json:"time"`
	Status   bool   `json:"status"`
}

// GetRecords 获取行为记录 query: (streamId or streamName) & from & to | null
func GetRecords(ctx *gin.Context) {
	RecordsArr := getRecords(
		ctx.Query("streamId"),
		ctx.Query("streamName"),
		ctx.Query("from"),
		ctx.Query("to"),
	)
	resultArr := functional.SliceReduce(
		RecordsArr,
		func(pre []RecordsWithStatus, curValue *model.Record, curIndex int) []RecordsWithStatus {
			pre[curIndex] = RecordsWithStatus{
				RecordID: curValue.RecordID,
				CarID:    curValue.CarID,
				StreamID: curValue.StreamID,
				ActionID: curValue.ActionID,
				Time:     curValue.Time,
				Status:   RecordStatus(curValue.ActionID),
			}
			return pre
		},
		make([]RecordsWithStatus, len(RecordsArr)),
	)
	utils.SuccessResponse(ctx, "查询成功", resultArr)
}

func getRecords(streamIdStr, streamName, from, to string) (resultArr []*model.Record) {
	var (
		streamId, ok = utils.ParseInt(streamIdStr)
		startTime, _ = utils.ParseInt(from)
		endTime, _   = utils.ParseInt(to)
	)
	if streamName != "" {
		stream, err := service.Stream.WithContext(context.Background()).
			Where(service.Stream.StreamName.Eq(streamName)).
			First()
		if err == nil {
			streamId = int(stream.StreamID)
			ok = true
		}
	}
	var query = func(conds ...gen.Condition) {
		resultArr, _ = service.Record.WithContext(context.Background()).
			Where(conds...).
			Order(service.Record.Time.Desc()).
			Find()
	}
	if ok && startTime != 0 && endTime != 0 {
		query(
			service.Record.Time.Gte(int64(startTime)),
			service.Record.Time.Lte(int64(endTime)),
			service.Record.StreamID.Eq(int32(streamId)),
		)
	} else if startTime != 0 && endTime != 0 {
		query(
			service.Record.Time.Gte(int64(startTime)),
			service.Record.Time.Lte(int64(endTime)),
		)
	} else if ok {
		query(service.Record.StreamID.Eq(int32(streamId)))
	} else if streamName == "" && startTime == 0 && endTime == 0 {
		query()
	} else {
		resultArr = []*model.Record{}
	}
	return resultArr
}

const NormalName = "正常"
const TempTime = time.Hour
const TempKey = "actions_normal_id"

func RecordStatus(actionID int64) bool {
	var (
		tempId, err    = redis.Get(context.Background(), TempKey)
		NormalActionId int64
		ok             bool
		idStr          string
	)
	if err != nil {
		NormalActionId = getNormalActionId()
		err = redis.Set(context.Background(), TempKey, NormalActionId, TempTime)
		if err != nil {
			logger.New("redis").Println(err.Error())
		}
		ok = true
	} else {
		idStr, ok = tempId.(string)
		if ok {
			NormalActionId, ok = utils.ParseInt64(idStr)
		}
	}
	if !ok {
		NormalActionId = getNormalActionId()
	}
	return actionID == NormalActionId
}
func getNormalActionId() int64 {
	actions := getActions()
	return functional.SliceReduce(
		actions,
		func(pre int64, curValue *model.Action, curIndex int) int64 {
			if curValue.ActionName == NormalName {
				pre = curValue.ActionID
			}
			return pre
		},
		0,
	)
}
