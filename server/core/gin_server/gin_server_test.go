package gin_server

import (
	"shiina-mahiru.cn/gin_server/pkg/conf"
	"testing"
)

func TestInitWithInject(t *testing.T) {
	var port = 8080
	var mode = conf.ModeDebug
	AddJsonPath("./testdata/gin.config.json")
	err := InitWithInject(conf.Options{
		RunningPort:    &port,
		RunningMode:    &mode,
		PrintStack:     nil,
		CorsConf:       nil,
		InternalErrMsg: nil,
		Ascii: func(opt conf.Options) string {
			return opt.String()
		},
		Key:   nil,
		Chain: nil,
		SSL:   nil,
	})
	if err != nil {
		t.Error(err)
	}
}
