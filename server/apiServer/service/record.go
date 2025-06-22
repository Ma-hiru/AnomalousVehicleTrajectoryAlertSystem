package service

import "server/apiServer/model"

// CreateRecord  增加行为记录
func CreateRecord(records []*model.Records) (rowsAffected int64, err error) {
	if records == nil {
		return 0, nil
	}
	result := db.Create(records)
	return result.RowsAffected, result.Error
}

// GetRecord 获取行为记录
func GetRecord(condition any) (records []*model.Records, ok bool) {
	if condition != nil {
		res := db.Where(condition).Find(&records)
		return records, res.Error == nil
	} else {
		res := db.Find(&records)
		return records, res.Error == nil
	}
}

// DelRecord 删除行为记录
func DelRecord(records []*model.Records) (rowsAffected int64, err error) {
	if records == nil {
		return 0, nil
	}
	res := db.Unscoped().Delete(records)
	return res.RowsAffected, res.Error
}

// UpdateRecord 修改行为记录
func UpdateRecord(old *model.Records, new *model.Records) (rowsAffected int64, err error) {
	if old == nil || new == nil {
		return 0, nil
	}
	result := db.Model(old).Updates(new)
	return result.RowsAffected, result.Error
}
