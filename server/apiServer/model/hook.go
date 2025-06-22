package model

import "gorm.io/gorm"

func (r Records) AfterCreate(tx *gorm.DB) (err error) {
	//TODO: 添加数据后执行
	return
}
