package service

import (
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gorm.io/gorm/schema"
	"log"
	"os"
	"server/settings"
	"time"
)

var dbDialector = settings.DbDialector

var initConfig = &gorm.Config{
	NamingStrategy: schema.NamingStrategy{
		SingularTable: false,
	},
	Logger: logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			Colorful:      true,
			SlowThreshold: time.Second,
			LogLevel:      logger.Info,
		},
	),
}
