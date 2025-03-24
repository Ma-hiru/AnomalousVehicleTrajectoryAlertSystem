package utils

import (
	"reflect"

	"github.com/golang-jwt/jwt"
)

func StructToJWTMap(obj any) *jwt.MapClaims {
	res := make(jwt.MapClaims)
	val := reflect.ValueOf(obj)
	typ := val.Type()
	if val.Kind() == reflect.Ptr {
		val = val.Elem()
		typ = val.Type()
	}
	if val.Kind() != reflect.Struct {
		return nil
	}
	for i := 0; i < val.NumField(); i++ {
		field := typ.Field(i)
		fieldValue := val.Field(i)
		if fieldValue.Kind() == reflect.Struct {
			res[field.Name] = StructToJWTMap(fieldValue.Interface())
			continue
		}
		if fieldValue.Kind() == reflect.Ptr && fieldValue.Elem().Kind() == reflect.Struct {
			res[field.Name] = StructToJWTMap(fieldValue.Elem().Interface())
			continue
		}
		res[field.Name] = fieldValue.Interface()
	}
	return &res
}
