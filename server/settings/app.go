package settings

import (
	"errors"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"gorm.io/driver/mysql"
	"path/filepath"
	"server/model"
	"time"
)

// PemFilePath SSL证书路径格式
type PemFilePath = struct {
	Fullchain string
	Privkey   string
}

// PemFilePath 默认SSL证书路径
var defaultPemFilePath = PemFilePath{
	Fullchain: filepath.Join("./cert/fullchain.pem"),
	Privkey:   filepath.Join("./cert/privkey.pem"),
}

// IsSSL SSL参数返回函数
func IsSSL() (port string, ok bool, path PemFilePath, err error) {
	err = getParams(&port, &ok, &path)
	return
}

// ErrMsg 500错误信息
var ErrMsg = model.Response{
	Code:    500,
	Message: "服务器错误",
	Ok:      false,
	Data:    nil,
}

// CorsConfig 跨域设置
var CorsConfig = cors.Config{
	AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"},
	AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
	AllowCredentials: true,
	AllowAllOrigins:  *corsFlag,
	MaxAge:           12 * time.Hour,
	AllowOrigins:     []string{},
	ExposeHeaders:    []string{"Content-Length"},
}

// GinMode gin模式
func GinMode() (mode string, err error) {
	mode = *modeFlag
	if mode != gin.DebugMode && mode != gin.ReleaseMode {
		err = errors.New("无效的gin模式，有效模式为Debug、Release。")
	}
	return
}

// TokenExpireDefault Token有效时间
const TokenExpireDefault = 24 * time.Hour

// SecretKey JWT signedKey
var SecretKey = []byte("Mahiru")

// SigningMethod JWT signedMethods
var SigningMethod = jwt.SigningMethodHS256

// mysqlDsn 数据库
const mysqlDsn = "root:0514+@tcp(127.0.0.1:3306)/avtas?charset=utf8mb4&parseTime=True&loc=Local"

// mysqlDsn mysql适配器
var myDialector = mysql.Open(mysqlDsn)

// DbDialector 数据库适配器
var DbDialector = myDialector

// TokenPrefix Token前缀
const TokenPrefix = "Bearer "

// TimeFormat 时间格式
const TimeFormat = "%4d-%02d-%02d %02d:%02d:%02d"
