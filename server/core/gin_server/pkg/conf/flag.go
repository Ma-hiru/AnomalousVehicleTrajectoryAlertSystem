package conf

import "flag"

var settingsByFlag = Options{
	RunningPort: flag.Int("port", DefaultPort, "running port"),
	RunningMode: (*Mode)(flag.String("mode", string(DefaultMode), "running mode: debug | release | test")),
	PrintStack:  flag.Bool("stack", DefaultPrintStack, "print stack trace"),
	Key:         flag.String("key", DefaultKeyPath, "ssl key file path"),
	Chain:       flag.String("chain", DefaultCertPath, "ssl chain file path"),
	SSL:         flag.Bool("ssl", DefaultSSLStatus, "ssl mode"),
}

func ParseSettingsByFlag() {
	flag.Parse()
}
func GetSettingsByFlag() Options {
	return settingsByFlag
}
