package settings

import "gorm.io/driver/mysql"

// mysqlDsn 数据库
const mysqlDsn = "root:0514+@tcp(127.0.0.1:3306)/avtas?charset=utf8mb4&parseTime=True&loc=Local"

// mysqlDsn mysql适配器
var myDialector = mysql.Open(mysqlDsn)

// DbDialector 数据库适配器
var DbDialector = myDialector
