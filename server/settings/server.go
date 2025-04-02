package settings

import "gorm.io/driver/mysql"

const (
	// mysqlDsn 数据库
	mysqlDsn = "root:0514+@tcp(127.0.0.1:3306)/avtas?charset=utf8mb4&parseTime=True&loc=Local"
)

var (
	// mysqlDsn mysql适配器
	myDialector = mysql.Open(mysqlDsn)
	// DbDialector 数据库适配器
	DbDialector = myDialector
)
