package service

import (
	"fmt"
	"server/apiServer/model"
)

// CreateStream  增加视频流记录
func CreateStream(streams []*model.Streams) (rowsAffected int64, err error) {
	if streams == nil {
		return 0, nil
	}
	result := db.Create(streams)
	return result.RowsAffected, result.Error
}

// GetStream 获取视频流记录
func GetStream(condition any) (streams []*model.Streams, ok bool) {
	if condition != nil {
		res := db.Where(condition).Find(&streams)
		return streams, res.Error == nil
	} else {
		res := db.Find(&streams)
		for _, v := range streams {
			fmt.Printf("streams:%v\n", v)
		}
		return streams, res.Error == nil
	}
}

// GetStreamLayout 获取视频流记录
func GetStreamLayout(condition any) (streams []*model.StreamsLayout, ok bool) {
	if condition != nil {
		res := db.Table("streams").Where(condition).Find(&streams)
		return streams, res.Error == nil
	} else {
		res := db.Table("streams").Find(&streams)
		for _, v := range streams {
			fmt.Printf("streams:%v\n", v)
		}
		return streams, res.Error == nil
	}
}

// DelStream 删除视频流记录
func DelStream(streams []*model.Streams) (rowsAffected int64, err error) {
	if streams == nil {
		return 0, nil
	}
	res := db.Unscoped().Delete(streams)
	return res.RowsAffected, res.Error
}

// UpdateStream 修改车辆记录
func UpdateStream(old *model.Streams, new *model.Streams) (rowsAffected int64, err error) {
	if old == nil || new == nil {
		return 0, nil
	}
	result := db.Model(old).Updates(new)
	return result.RowsAffected, result.Error
}
