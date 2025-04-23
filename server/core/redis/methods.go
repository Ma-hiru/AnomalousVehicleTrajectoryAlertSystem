package redis

import (
	"context"
	"github.com/go-redis/redis/v8"
	"time"
)

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
