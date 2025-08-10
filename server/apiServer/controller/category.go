package controller

import (
	"context"
	"server/apiServer/model"
	"server/apiServer/service"
	"server/core/enum"
	"server/core/functional"
	"server/utils"

	"github.com/gin-gonic/gin"
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
	maxActionId := getActionsMaxId()
	Category := make([][]int, gap.gapLen+1)
	// 初始化每个时间段的行为统计数组
	for i := range Category {
		Category[i] = make([]int, maxActionId+1)
	}
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

// GetExceptionCount 获取异常行为总数 query: from & to | null(all)
func GetExceptionCount(ctx *gin.Context) {
	startTime, okFrom := utils.ParseInt64(ctx.Query("from"))
	endTime, okTo := utils.ParseInt64(ctx.Query("to"))
	if okFrom && okTo {
		if startTime < endTime {
			normalId := getNormalActionId()
			enum.NewResultFrom(service.Record.
				WithContext(context.Background()).
				Where(
					service.Record.Time.Gte(startTime),
					service.Record.Time.Lte(endTime),
				).
				Where(service.Record.ActionID.Neq(normalId)).
				Count,
			).OnOk(func(count int64) {
				utils.SuccessResponse(ctx, "获取成功", count)
			}).OnErrPure(func() {
				utils.FailResponse(ctx, 201, "获取异常行为总数失败")
			})
		} else {
			utils.FailResponse(ctx, 201, "时间参数错误")
			return
		}
	} else {
		normalId := getNormalActionId()
		enum.NewResultFrom(service.Record.
			WithContext(context.Background()).
			Where(service.Record.ActionID.Neq(normalId)).
			Count,
		).OnOk(func(count int64) {
			utils.SuccessResponse(ctx, "获取成功", count)
		}).OnErrPure(func() {
			utils.FailResponse(ctx, 201, "获取异常行为总数失败")
		})
	}
}
