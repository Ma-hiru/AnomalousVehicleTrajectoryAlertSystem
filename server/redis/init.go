package redis

import (
	"context"
	redis "github.com/go-redis/redis/v8"
	"log"
	"time"
)

var Rdb *redis.Client

func init() {
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
func Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	return Rdb.Set(ctx, key, value, expiration).Err()
}
func Get(ctx context.Context, key string) (val any, err error) {
	val, err = Rdb.Get(ctx, key).Result()
	return
}
func Del(ctx context.Context, key string) error {
	return Rdb.Del(ctx, key).Err()
}

// HSet example @params (ctx, "user:1", "name", "李四", "age", 25)
func HSet(ctx context.Context, key string, val map[string]any) error {
	return Rdb.HSet(ctx, key, val).Err()
}
func HGet(ctx context.Context, name string, key string) error {
	return Rdb.HGet(ctx, name, key).Err()
}
func Pipe(ctx context.Context, opt func(pipe redis.Pipeliner)) ([]redis.Cmder, error) {
	pipe := Rdb.Pipeline()
	if opt != nil {
		opt(pipe)
	}
	return pipe.Exec(ctx)
}
