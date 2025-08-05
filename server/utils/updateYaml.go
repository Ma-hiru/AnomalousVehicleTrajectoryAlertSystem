package utils

import (
	"os"
	"path/filepath"
)

var yamlPath = filepath.Join(".", "go2rtc.yaml")

func UpdateYaml(content string) error {
	return os.WriteFile(yamlPath, []byte(content), 0644)
}
