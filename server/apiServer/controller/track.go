package controller

import (
	"context"
	"github.com/gin-gonic/gin"
	"server/apiServer/model"
	"server/apiServer/service"
	"server/core/functional"
	"server/utils"
)

type TrackDetail struct {
	StreamId  int32           `json:"streamId"`
	TimeRange [2]int64        `json:"timeRange"` //[start end] 时间范围
	Records   []*model.Record `json:"records"`
}
type TrackItem struct {
	CarId     string                 `json:"carId"`
	ActionIds map[int64]int          `json:"actionIds"`
	Time      int64                  `json:"time"`
	Track     map[int32]*TrackDetail `json:"track"`
}
type TrackList struct {
	CarId     string         `json:"carId"`
	ActionIds []int64        `json:"actionIds"`
	Time      int64          `json:"time"`
	Track     []*TrackDetail `json:"track"`
}

// GetTrackList 获取异常轨迹列表 query: (from & to)| keywords
func GetTrackList(ctx *gin.Context) {
	normalId := getNormalActionId()
	keywords := ctx.Query("keywords")
	from, ok := utils.ParseInt64(ctx.Query("from"))
	if !ok {
		utils.FailResponse(ctx, 201, "参数from错误")
		return
	}
	to, ok := utils.ParseInt64(ctx.Query("to"))
	if !ok {
		utils.FailResponse(ctx, 201, "参数to错误")
		return
	}
	offset, ok := utils.ParseInt(ctx.Query("offset"))
	if !ok {
		utils.FailResponse(ctx, 201, "参数offset错误")
		return
	}
	limit, ok := utils.ParseInt(ctx.Query("limit"))
	if !ok {
		utils.FailResponse(ctx, 201, "参数limit错误")
		return
	}
	query := service.Record.WithContext(context.Background()).
		Where(service.Record.ActionID.Neq(normalId)).
		Where(service.Record.Time.Between(from, to)).
		Where(service.Record.CarID.Like("%" + keywords + "%"))
	total, err := query.Count()
	if err != nil {
		utils.FailResponse(ctx, 201, "获取异常轨迹列表失败")
		return
	}
	records, err := query.
		Offset(offset).
		Limit(limit).
		Find()
	if err != nil {
		utils.FailResponse(ctx, 201, "获取异常轨迹列表失败")
		return
	}
	result := calculateTrackItem(records)
	utils.SuccessResponse(ctx, "获取异常轨迹列表成功", gin.H{
		"total": total,
		"items": result,
	})
}

func calculateTrackItem(records []*model.Record) []*TrackList {
	CountMap := make(map[string]*TrackItem)
	functional.SliceForEach(records, func(value *model.Record, index int) {
		trackItem, ok := CountMap[value.CarID]
		if !ok {
			CountMap[value.CarID] = &TrackItem{
				CarId:     value.CarID,
				ActionIds: make(map[int64]int),
				Time:      value.Time,
				Track:     make(map[int32]*TrackDetail),
			}
			trackItem = CountMap[value.CarID]
		}
		if value.Time > trackItem.Time {
			trackItem.Time = value.Time
		}
		_, ok = trackItem.ActionIds[value.ActionID]
		if !ok {
			trackItem.ActionIds[value.ActionID] = 1
		} else {
			trackItem.ActionIds[value.ActionID]++
		}
		trackDetail, ok := trackItem.Track[value.StreamID]
		if !ok {
			trackItem.Track[value.StreamID] = &TrackDetail{
				StreamId:  value.StreamID,
				TimeRange: [2]int64{value.Time, value.Time},
				Records:   make([]*model.Record, 0),
			}
			trackDetail = trackItem.Track[value.StreamID]
		}
		if value.Time < trackDetail.TimeRange[0] {
			trackDetail.TimeRange[0] = value.Time
		} else if value.Time > trackDetail.TimeRange[1] {
			trackDetail.TimeRange[1] = value.Time
		}
		trackDetail.Records = append(trackDetail.Records, value)
	})
	return functional.MapReduce(
		CountMap,
		func(pre []*TrackList, curKey string, curValue *TrackItem) []*TrackList {
			return append(pre, &TrackList{
				CarId:     curValue.CarId,
				ActionIds: functional.MapKeyAsSlice(curValue.ActionIds),
				Time:      curValue.Time,
				Track:     functional.MapValueAsSlice(curValue.Track),
			})
		},
		make([]*TrackList, 0),
	)
}

// GetAnomalyCount 获取各个视频流的异常数 query: from & to
func GetAnomalyCount(ctx *gin.Context) {
	normalId := getNormalActionId()
	from, ok := utils.ParseInt64(ctx.Query("from"))
	if !ok {
		utils.FailResponse(ctx, 201, "参数from错误")
		return
	}
	to, ok := utils.ParseInt64(ctx.Query("to"))
	if !ok {
		utils.FailResponse(ctx, 201, "参数to错误")
		return
	}
	query := service.Record
	results := make([]*AnomalyCountResult, 0)
	err := query.WithContext(context.Background()).
		Select(
			query.StreamID,
			query.StreamID.Count().As("count"),
		).
		Where(
			query.ActionID.Neq(normalId),
			query.Time.Between(from, to),
		).
		Group(query.StreamID).
		Scan(&results)
	if err != nil {
		utils.FailResponse(ctx, 201, "查询失败")
	}
	utils.SuccessResponse(ctx, "查询成功", results)
}

type AnomalyCountResult struct {
	StreamID int `gorm:"column:streamId;not null" json:"streamId"`
	Count    int `gorm:"column:count" json:"count"`
}
