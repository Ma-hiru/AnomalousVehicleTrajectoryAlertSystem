package conf

import (
	"dario.cat/mergo"
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
)

var JsonInvalid = errors.New("json options invalid")
var settingsByJson = Options{}

const DefaultJsonConfPath = "./gin.config.json"

func ParseSettingsByJson(paths ...string) error {
	var (
		backupSettings = settingsByJson
		newOptions     = Options{}
		content        []byte
		err            error
		backup         = func(err error) error {
			settingsByJson = backupSettings
			return err
		}
	)
	for _, path := range paths {
		content, err = os.ReadFile(filepath.Join(path))
		if err != nil {
			if errors.Is(err, os.ErrNotExist) {
				continue
			}
		}
		err = json.Unmarshal(content, &newOptions)
		if err != nil {
			return backup(JsonInvalid)
		}
		err = mergo.Merge(&settingsByJson, newOptions, mergo.WithOverride)
		if err != nil {
			return backup(err)
		}
	}
	return nil
}
func GetSettingsByJson() Options {
	return settingsByJson
}
