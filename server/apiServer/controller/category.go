package controller

import (
	"github.com/gin-gonic/gin"
	"server/apiServer/model"
	"server/core/functional"
	"server/utils"
)

// GetCategory 获取行为分类统计 (streamId or streamName) & from & to | null(all)
func GetCategory(ctx *gin.Context) {
	Category := make([]int, getActionsMaxId()+1)
	recordsForEach(
		ctx.Query("streamId"),
		ctx.Query("streamName"),
		ctx.Query("from"),
		ctx.Query("to"),
		func(value *model.Record, index int) {
			Category[value.ActionID]++
		},
	)
	utils.SuccessResponse(ctx, "获取成功", Category)
}

// GetCategoryMinute 按分钟获取行为分类统计 query: (streamId or streamName or null) & from & to & gap(Minute)
func GetCategoryMinute(ctx *gin.Context) {
	from := ctx.Query("from")
	to := ctx.Query("to")
	gapTime, okGap := utils.ParseInt64(ctx.Query("gap"))
	startTime, okFrom := utils.ParseInt64(from)
	endTime, okTo := utils.ParseInt64(to)
	if !okFrom || !okTo || !okGap || startTime >= endTime {
		utils.FailResponse(ctx, 201, "时间参数错误")
		return
	}
	gap := NewGap(startTime, endTime, gapTime)
	Category := make([][]int, gap.gapLen+1)
	recordsForEach(
		ctx.Query("streamId"),
		ctx.Query("streamName"),
		from,
		to,
		func(value *model.Record, index int) {
			Category[gap.LocateGaps(value.Time)][value.ActionID]++
		},
	)
	utils.SuccessResponse(ctx, "获取成功", Category)
}

func recordsForEach(
	streamId, streamName, from, to string,
	handler func(value *model.Record, index int),
) {
	Records := getRecords(streamId, streamName, from, to)
	functional.SliceForEach(Records, handler)
}

type Gap struct {
	start  int64
	end    int64
	gap    int64
	gapLen int64
}

func (g *Gap) LocateGaps(time int64) int64 {
	if time < g.start {
		return 0
	} else if time > g.end {
		return g.gapLen
	} else {
		return (time - g.start) / 1000 / 60 / g.gap
	}
}

func NewGap(start, end, gap int64) *Gap {
	return &Gap{
		start:  start,
		end:    end,
		gap:    gap,
		gapLen: (end - start) / 1000 / 60 / gap,
	}
}
