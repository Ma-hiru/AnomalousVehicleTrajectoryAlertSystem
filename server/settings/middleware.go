package settings

import (
	"github.com/golang-jwt/jwt"
	"time"
)

var (
	// SecretKey JWT signedKey
	SecretKey = []byte("Mahiru")
	// SigningMethod JWT signedMethods
	SigningMethod = jwt.SigningMethodHS256
)

const (
	// TokenExpireDefault Token有效时间
	TokenExpireDefault = 24 * time.Hour
	// TokenPrefix Token前缀
	TokenPrefix = "Bearer "
	// TimeFormat 时间格式
	TimeFormat = "%4d-%02d-%02d %02d:%02d:%02d"
	// Go2rtcBaseUrl go2rtc port
	Go2rtcBaseUrl = "http://localhost:3001"
)

type (
	// TokenStruct Token Struct
	TokenStruct = struct {
		Id       int    `json:"id"`
		Username string `json:"username"`
	}
)
