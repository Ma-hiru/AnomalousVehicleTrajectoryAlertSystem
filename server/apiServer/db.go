package apiServer

import (
	"fmt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"server/apiServer/service"
	"server/settings"
)

func connect(dsn string) *gorm.DB {
	db, err := gorm.Open(mysql.Open(dsn))
	if err != nil {
		panic(fmt.Errorf("connect db fail: %w", err))
	}
	return db
}

//go:generate go run ../cmd/gorm_gen.go
func init() {
	DB := connect(settings.MySqlDSN).Debug()
	service.SetDefault(DB)
}
