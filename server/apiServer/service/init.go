package service

import (
	"gorm.io/gorm"
	"shiina-mahiru.cn/gin_server/pkg/logger"
)

var (
	db  *gorm.DB
	err error
)

func init() {
	if db, err = gorm.Open(dbDialector, initConfig); err != nil {
		logger.New("GORM").Panic("数据库连接失败" + err.Error())
	} else {
		logger.New("GORM").Println("连接数据库成功")
	}
}

func GetDbInstance() *gorm.DB {
	return db
}
