package service

import (
	"gorm.io/gorm"
	"server/utils"
)

var (
	db  *gorm.DB
	err error
)

func init() {
	if db, err = gorm.Open(dbDialector, initConfig); err != nil {
		utils.Logger("GORM").Panic("数据库连接失败")
	} else {
		utils.Logger("GORM").Println("连接数据库成功")
	}
}

func GetDbInstance() *gorm.DB {
	return db
}
