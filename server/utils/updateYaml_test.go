package utils

import (
	"fmt"
	"testing"
)

func TestUpdateYaml(t *testing.T) {
	err := UpdateYaml("1")
	fmt.Println(err)
}
