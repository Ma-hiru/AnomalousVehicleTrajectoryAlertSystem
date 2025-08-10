package apiServer

import (
	"fmt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"server/apiServer/service"
	"server/settings"
)

func connect(dsn string) *gorm.DB {
	db, err := gorm.Open(
		mysql.Open(dsn),
		&gorm.Config{Logger: logger.Default.LogMode(logger.Silent)},
	)
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
