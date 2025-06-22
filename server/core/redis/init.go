package redis

import (
	"github.com/go-redis/redis/v8"
	"log"
	"time"
)

var Rdb *redis.Client

func Init() {
	Rdb = redis.NewClient(&redis.Options{
		Addr:         "localhost:6379",
		PoolSize:     20,
		MinIdleConns: 10,
		IdleTimeout:  30 * time.Second,
		Password:     "",
		DB:           0,
	})
	if Rdb == nil {
		log.Println("Redis，初始化失败！")
	} else {
		log.Println(Rdb)
	}
}
