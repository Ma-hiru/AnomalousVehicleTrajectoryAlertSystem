package settings

import (
	"encoding/json"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"os"
	"path/filepath"
	"shiina-mahiru.cn/gin_server/pkg/logger"
	"strings"
	"text/template"
)

type JsonConfig = struct {
	Mysql struct {
		User     string `json:"user"`
		Password string `json:"password"`
		Port     int    `json:"port"`
		Schema   string `json:"schema"`
	} `json:"mysql"`
}

var (
	// mysqlDsn mysql适配器
	myDialector gorm.Dialector
	// DbDialector 数据库适配器
	DbDialector = myDialector
	// JsonConfig json配置
	jsonConfig JsonConfig
)

func init() {
	jsonData, err := os.ReadFile(filepath.Join("./database.config.json"))
	if err != nil {
		logger.New("MySQL").Panic("数据库配置错误：" + err.Error())
		return
	}
	err = json.Unmarshal(jsonData, &jsonConfig)
	if err != nil {
		logger.New("MySQL").Panic("数据库配置错误：" + err.Error())
		return
	}

	temp := "{{.User}}:{{.Password}}@tcp(127.0.0.1:{{.Port}})/{{.Schema}}?charset=utf8mb4&parseTime=True&loc=Local"
	res := template.Must(template.New("database").Parse(temp))
	builder := strings.Builder{}

	err = res.Execute(&builder, jsonConfig.Mysql)
	if err != nil {
		logger.New("MySQL").Panic("数据库配置错误：" + err.Error())
		return
	}

	myDialector = mysql.Open(builder.String())
}
