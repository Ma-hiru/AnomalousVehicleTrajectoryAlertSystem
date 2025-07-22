package conf

import (
	"fmt"
	"testing"
)

func TestParseSettingsByJson(t *testing.T) {
	if err := ParseSettingsByJson(DefaultJsonConfPath, "./gin.config2.json"); err != nil {
		t.Error("ParseSettingsByJson error", err.Error())
	} else {
		t.Log("ParseSettingsByJson success")
		options := GetSettingsByJson()
		fmt.Printf("%v\n", options)
	}
}
