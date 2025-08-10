package controller

import (
	"context"
	"github.com/gin-gonic/gin"
	"server/apiServer/model"
	"server/apiServer/service"
	"server/core/enum"
	"server/core/functional"
	"server/utils"
	"strings"
)

// GetVideos 获取视频列表 query: streamId or streamName(like) | null(all)
func GetVideos(ctx *gin.Context) {
	var (
		resultArr    []*model.Stream
		streamName   = ctx.Query("streamName")
		streamId, ok = utils.ParseInt(ctx.Query("streamId"))
	)
	if streamName == "" && !ok {
		resultArr, _ = service.Stream.WithContext(context.Background()).Find()
	} else {
		resultArr, _ = service.Stream.WithContext(context.Background()).
			Where(service.Stream.StreamID.Eq(int32(streamId))).
			Or(service.Stream.StreamName.Like(streamName)).
			Find()
	}
	utils.SuccessResponse(ctx, "查询成功", resultArr)
}

type VideosParams struct {
	StreamId   int     `json:"streamId" binding:"required" form:"streamId"`
	StreamName string  `json:"streamName,omitempty" form:"streamName"`
	Addr       string  `json:"addr,omitempty" form:"addr"`
	Latitude   float64 `json:"latitude,omitempty"  form:"latitude"`
	Longitude  float64 `json:"longitude,omitempty"  form:"longitude"`
}

// PatchVideos 更新视频列表 param: streamId streamName? addr? latitude? longitude?
func PatchVideos(ctx *gin.Context) {
	type VideosParams struct {
		StreamId   int     `json:"streamId" binding:"required" form:"streamId"`
		StreamName string  `json:"streamName,omitempty" form:"streamName"`
		Addr       string  `json:"addr,omitempty" form:"addr"`
		Latitude   float64 `json:"latitude,omitempty"  form:"latitude"`
		Longitude  float64 `json:"longitude,omitempty"  form:"longitude"`
	}
	params := VideosParams{}
	if err := ctx.ShouldBind(&params); err != nil {
		utils.FailResponse(ctx, 201, "参数错误")
	} else {
		info, err := service.Stream.WithContext(context.Background()).
			Where(service.Stream.StreamID.Eq(int32(params.StreamId))).
			Updates(model.Stream{
				StreamName: params.StreamName,
				Addr:       params.Addr,
				Latitude:   params.Latitude,
				Longitude:  params.Longitude,
			})
		if err != nil {
			utils.CustomResponse(ctx, &utils.Response{
				Code:    201,
				Message: "修改失败",
				Ok:      false,
				Data: gin.H{
					"rowsAffected": info.RowsAffected,
					"err":          err.Error(),
				},
			})
		} else {
			utils.SuccessResponse(ctx, "修改成功", gin.H{
				"rowsAffected": info.RowsAffected,
			})
		}
	}
}

type SettingsVideosParams struct {
	StreamName string  `json:"streamName" binding:"required" form:"streamName"`
	Addr       string  `json:"addr,omitempty" form:"addr"`
	Latitude   float64 `json:"latitude" binding:"required" form:"latitude"`
	Longitude  float64 `json:"longitude" binding:"required" form:"longitude"`
}

// SettingsVideos param: {streamName addr? latitude longitude}[]
func SettingsVideos(ctx *gin.Context) {
	var params = utils.ShouldBind(ctx, make([]SettingsVideosParams, 0))
	if params.IsErr() {
		utils.FailResponse(ctx, 201, "参数错误")
		return
	}

	var count int64
	diffVideosList(*params.Unwrap()).
		Then(func(del []*model.Stream) *enum.Result[any] {
			for _, item := range del {
				info, err := service.Stream.
					WithContext(context.Background()).
					Where(service.Stream.StreamID.Eq(item.StreamID)).
					Delete()
				if err != nil {
					utils.CustomResponse(ctx, &utils.Response{
						Code:    201,
						Message: "删除失败",
						Ok:      false,
						Data: gin.H{
							"rowsAffected": info.RowsAffected,
							"err":          err.Error(),
						},
					})
					return enum.Ok[any](false)
				}
				count += info.RowsAffected
			}
			return enum.Ok[any](true)
		}).
		Then(func(value any) *enum.Result[any] {
			var data = value.(bool)
			if !data {
				return enum.Ok[any](false)
			}
			for _, query := range *params.Unwrap() {
				res, _ := service.Stream.WithContext(context.Background()).
					Where(service.Stream.StreamName.Eq(query.StreamName)).
					Find()
				if len(res) > 0 {
					info, err := service.Stream.WithContext(context.Background()).
						Where(service.Stream.StreamName.Eq(query.StreamName)).
						Updates(model.Stream{
							StreamName: query.StreamName,
							Addr:       query.Addr,
							Latitude:   query.Latitude,
							Longitude:  query.Longitude,
						})
					count += info.RowsAffected
					if err != nil {
						utils.CustomResponse(ctx, &utils.Response{
							Code:    201,
							Message: "修改失败",
							Ok:      false,
							Data: gin.H{
								"rowsAffected": count,
								"err":          err.Error(),
							},
						})
						return enum.Ok[any](false)
					}
				} else {
					err := service.Stream.WithContext(context.Background()).Create(&model.Stream{
						StreamName: query.StreamName,
						Addr:       query.Addr,
						Latitude:   query.Latitude,
						Longitude:  query.Longitude,
					})
					if err != nil {
						utils.CustomResponse(ctx, &utils.Response{
							Code:    201,
							Message: "修改失败",
							Ok:      false,
							Data: gin.H{
								"rowsAffected": count,
								"err":          err.Error(),
							},
						})
						return enum.Ok[any](false)
					}
					count++
				}
			}
			return enum.Ok[any](true)
		}).
		Then(func(value any) *enum.Result[any] {
			var data = value.(bool)
			if data {
				utils.SuccessResponse(ctx, "修改成功", gin.H{
					"rowsAffected": count,
				})
			}
			return enum.Ok[any](true)
		}).
		OnErr(func(err error) {
			utils.Logger().Println(err.Error())
			utils.CustomResponse(ctx, &utils.Response{
				Code:    201,
				Message: "修改失败",
				Ok:      false,
				Data: gin.H{
					"rowsAffected": count,
				},
			})
		})
}

func diffVideosList(params []SettingsVideosParams) *enum.Result[[]*model.Stream] {
	var all, err = service.Stream.WithContext(context.Background()).Find()
	if err != nil {
		return enum.Err[[]*model.Stream](err)
	}
	return enum.Ok(
		functional.SliceReduce(
			all,
			func(pre []*model.Stream, curValue *model.Stream, curIndex int) []*model.Stream {
				for _, item := range params {
					if item.StreamName == curValue.StreamName {
						return pre
					}
				}
				pre = append(pre, curValue)
				return pre
			},
			make([]*model.Stream, 0),
		),
	)
}

// AddVideos 添加视频流信息 param: streamName addr? latitude longitude
func AddVideos(ctx *gin.Context) {
	params := struct {
		StreamName string  `json:"streamName" binding:"required" form:"streamName"`
		Addr       string  `json:"addr,omitempty" form:"addr"`
		Latitude   float64 `json:"latitude" binding:"required" form:"latitude"`
		Longitude  float64 `json:"longitude" binding:"required" form:"longitude"`
	}{}
	if err := ctx.ShouldBind(&params); err != nil {
		utils.FailResponse(ctx, 201, "参数错误")
	} else {
		err := service.Stream.WithContext(context.Background()).
			Create(&model.Stream{
				StreamName: params.StreamName,
				Addr:       params.Addr,
				Latitude:   params.Latitude,
				Longitude:  params.Longitude,
			})
		if err != nil {
			errMsg := err.Error()
			if strings.Contains(errMsg, "Duplicate entry") {
				errMsg = "视频流已存在"
			}
			utils.CustomResponse(ctx, &utils.Response{
				Code:    201,
				Message: "添加失败",
				Ok:      false,
				Data: gin.H{
					"err": errMsg,
				},
			})
			return
		} else {
			utils.SuccessResponse(ctx, "添加成功", gin.H{})
		}
	}
}

// DelVideos 删除视频流信息 query: streamId | streamName
func DelVideos(ctx *gin.Context) {
	var (
		streamName  = ctx.Query("streamName")
		streamId, _ = utils.ParseInt(ctx.Query("streamId"))
	)
	info, err := service.Stream.WithContext(context.Background()).
		Where(service.Stream.StreamID.Eq(int32(streamId))).
		Or(service.Stream.StreamName.Eq(streamName)).
		Delete()
	if err != nil {
		utils.CustomResponse(ctx, &utils.Response{
			Code:    201,
			Message: "删除失败",
			Ok:      false,
			Data: gin.H{
				"rowsAffected": info.RowsAffected,
			},
		})
	} else {
		utils.SuccessResponse(ctx, "删除成功", gin.H{
			"rowsAffected": info.RowsAffected,
		})
	}
}
