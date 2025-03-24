package middleware

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"server/settings"
	"server/utils"
	"strings"
	"time"
)

func GenerateToken(data *jwt.MapClaims, expireTime time.Duration) (string, error) {
	token := jwt.NewWithClaims(settings.SigningMethod, *data)
	tokenString, _ := token.SignedString(settings.SecretKey)
	if tokenString == "" {
		return tokenString, errors.New("token生成错误！")
	}
	return tokenString, nil
}
func Validate(prefix string) gin.HandlerFunc {
	return func(context *gin.Context) {
		authHeader := context.GetHeader("Authorization")
		if authHeader == "" {
			utils.UnauthorizedResponse(context)
			context.Abort()
			return
		}
		tokenString := strings.TrimPrefix(authHeader, prefix)
		if tokenString == authHeader {
			utils.UnauthorizedResponse(context)
			context.Abort()
			return
		}
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return settings.SecretKey, nil
		})
		if err != nil {
			utils.FailResponse(context, 201, fmt.Sprintln(err))
		}
		if !token.Valid {
			utils.UnauthorizedResponse(context)
			context.Abort()
			return
		}
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			context.Set("token", claims)
		}
		context.Next()
	}
}
func ValidateToken(code string) (ok bool) {
	if code == "" {
		return
	}
	if token, err := jwt.Parse(code, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return settings.SecretKey, nil
	}); err != nil {
		return
	} else {
		if token.Valid {
			return true
		}
		return
	}
}
