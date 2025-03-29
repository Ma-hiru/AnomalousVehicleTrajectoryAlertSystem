package utils

import (
	"context"
	"github.com/golang-jwt/jwt"
	"log"
	"server/model"
	"server/redis"
	"server/service"
)

// TokenCheckFn Token Check
var TokenCheckFn = func(claims jwt.MapClaims, token string) bool {
	if user, ok := service.GetUser(model.User{
		Id:       int(claims["Id"].(float64)),
		Username: claims["Username"].(string),
	}); ok {
		if user.Status.V == 1 {
			if id, err := redis.Get(context.Background(), token); err != nil {
				if id.(int) == user.Id {
					log.Println("token check success", token, id)
					return true
				}
			}
		}
	}
	return false
}
