package service

import (
	"gorm.io/gorm"
	"gorm.io/gorm/schema"
)

var Db *gorm.DB

func init() {
	var err error
	if Db, err = gorm.Open(dbDialector, &gorm.Config{
		NamingStrategy: schema.NamingStrategy{
			SingularTable: false,
		},
	}); err != nil {
		panic("数据库连接失败！")
	}
}
