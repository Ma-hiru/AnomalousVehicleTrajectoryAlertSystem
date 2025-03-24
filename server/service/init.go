package service

import (
	"gorm.io/gorm"
	"gorm.io/gorm/schema"
	"server/settings"
)

var Db *gorm.DB

func init() {
	var err error
	if Db, err = gorm.Open(settings.DbDialector, &gorm.Config{
		NamingStrategy: schema.NamingStrategy{
			SingularTable: false,
		},
	}); err != nil {
		panic("数据库连接失败！")
	}
}
