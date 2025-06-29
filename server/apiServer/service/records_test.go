package service

import (
	"fmt"
	"testing"
)

func TestGetRecord(t *testing.T) {
	res, _ := GetRecord("time >= 1751238202000")
	fmt.Println(res)
	t.Log(res)
}
