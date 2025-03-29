package settings

import (
	"github.com/golang-jwt/jwt"
	"time"
)

// TokenExpireDefault Token有效时间
const TokenExpireDefault = 24 * time.Hour

// SecretKey JWT signedKey
var SecretKey = []byte("Mahiru")

// SigningMethod JWT signedMethods
var SigningMethod = jwt.SigningMethodHS256

// TokenPrefix Token前缀
const TokenPrefix = "Bearer "

// TokenStruct Token Struct
type TokenStruct = struct {
	Id       int    `json:"id"`
	Username string `json:"username"`
}

// TimeFormat 时间格式
const TimeFormat = "%4d-%02d-%02d %02d:%02d:%02d"

// Go2rtcBaseUrl go2rtc port
const Go2rtcBaseUrl = "http://localhost:3001"
