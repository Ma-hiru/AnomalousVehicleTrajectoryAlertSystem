package service

import "server/apiServer/model"

// CreateCar 增加车辆记录
func CreateCar(cars []*model.Cars) (rowsAffected int64, err error) {
	if cars == nil {
		return 0, nil
	}
	result := db.Create(cars)
	return result.RowsAffected, result.Error
}

// GetCar 获取车辆记录
func GetCar(condition any) (cars []*model.Cars, ok bool) {
	if condition != nil {
		res := db.Where(condition).Find(&cars)
		return cars, res.Error == nil
	} else {
		res := db.Find(&cars)
		return cars, res.Error == nil
	}
}

// DelCar 删除车辆记录
func DelCar(cars []*model.Cars) (rowsAffected int64, err error) {
	if cars == nil {
		return 0, nil
	}
	res := db.Unscoped().Delete(cars)
	return res.RowsAffected, res.Error
}

// UpdateCar 修改车辆记录
func UpdateCar(old *model.Cars, new *model.Cars) (rowsAffected int64, err error) {
	if old == nil || new == nil {
		return 0, nil
	}
	result := db.Model(old).Updates(new)
	return result.RowsAffected, result.Error
}
