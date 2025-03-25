package utils

import (
	"github.com/golang-jwt/jwt"
	"server/model"
	"server/service"
)

// TokenCheckFn Token Check
var TokenCheckFn = func(claims jwt.MapClaims) bool {
	if user, ok := service.GetUser(model.User{
		Id:       int(claims["id"].(float64)),
		Username: claims["username"].(string),
	}); ok {
		if user.Status.V == 1 {
			return true
		}
	}
	return false
}
