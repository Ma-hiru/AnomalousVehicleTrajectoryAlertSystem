package utils

//// TokenCheckFn Token Check
//var TokenCheckFn = func(claims jwt.MapClaims, token string) bool {
//	if id, ok := claims["Id"].(float64); !ok {
//		log.Println("jwt claims has no id or id is not float64")
//		return false
//	} else if username, ok := claims["Username"].(string); !ok {
//		log.Println("jwt claims has no username or username is not string")
//		return false
//	} else {
//		if user, ok := service.GetUser(model.User{
//			Id:       int(id),
//			Username: username,
//		}); ok {
//			if user.Status.V == 1 {
//				if id, err := redis.Get(context.Background(), token); err == nil {
//					userId, err := strconv.Atoi(id.(string))
//					if err != nil {
//						return false
//					}
//					if userId == user.Id {
//						return true
//					}
//				}
//			}
//		}
//		return false
//	}
//}
