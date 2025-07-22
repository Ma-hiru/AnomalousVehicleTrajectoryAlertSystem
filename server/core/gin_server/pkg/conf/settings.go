package conf

import "dario.cat/mergo"

var settingsByCode = Options{}

func InjectSettingsByCode(opt ...Options) error {
	backup := settingsByCode
	for _, option := range opt {
		err := mergo.Merge(&settingsByCode, option, mergo.WithOverride)
		if err != nil {
			settingsByCode = backup
			return err
		}
	}
	return nil
}
func GetSettingsByCode() Options {
	return settingsByCode
}
