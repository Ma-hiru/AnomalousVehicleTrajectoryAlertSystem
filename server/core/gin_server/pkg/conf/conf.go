package conf

import (
	"dario.cat/mergo"
	"errors"
	"shiina-mahiru.cn/gin_server/pkg/logger"
	"slices"
)

var flagParse = false
var JsonPath = []string{DefaultJsonConfPath}

func MergeConf(priority []Priority) (*Options, error) {
	var TotalSettings = Options{}
	slices.Reverse(priority)
	for _, p := range priority {
		switch p {
		case PriorityFlag:
			if !flagParse {
				ParseSettingsByFlag()
				flagParse = true
			}
			if err := mergo.Merge(&TotalSettings, GetSettingsByFlag(), mergo.WithOverride); err != nil {
				return nil, err
			}
		case PriorityJson:
			if err := ParseSettingsByJson(JsonPath...); err != nil {
				if errors.Is(err, JsonInvalid) {
					logger.New("GIN").Println(err.Error())
					continue
				}
				return nil, err
			} else {
				if err = mergo.Merge(&TotalSettings, GetSettingsByJson(), mergo.WithOverride); err != nil {
					return nil, err
				}
			}
		case PriorityCode:
			if err := mergo.Merge(&TotalSettings, GetSettingsByCode(), mergo.WithOverride); err != nil {
				return nil, err
			}
		default:
			return nil, errors.New("priority is not valid")
		}
	}
	return &TotalSettings, nil
}

type Priority int

const (
	PriorityFlag Priority = iota
	PriorityJson
	PriorityCode
)
