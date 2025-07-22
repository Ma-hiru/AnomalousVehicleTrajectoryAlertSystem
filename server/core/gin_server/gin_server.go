package gin_server

import (
	"github.com/gin-gonic/gin"
	"shiina-mahiru.cn/gin_server/internal/start"
	"shiina-mahiru.cn/gin_server/pkg/conf"
	"shiina-mahiru.cn/gin_server/pkg/logger"
)

var withUse []func(engine *gin.Engine)

func WithUse(use ...func(engine *gin.Engine)) {
	withUse = append(withUse, use...)
}
func Init(name string, version string) {
	if totalSettings, err := conf.MergeConf(
		[]conf.Priority{
			conf.PriorityJson,
			conf.PriorityFlag,
			conf.PriorityCode,
		},
	); err != nil {
		logger.New("GIN").Panic(err.Error())
		return
	} else {
		start.
			NewConfigEngine(totalSettings.RunningMode, name, version).
			ApplySettings(*totalSettings).
			ApplyWithUse(withUse).
			Run()
	}
}
func InitWithInject(settings conf.Options, name string, version string) error {
	err := conf.InjectSettingsByCode(settings)
	if err != nil {
		return err
	}
	Init(name, version)
	return nil
}
func AddJsonPath(path string) {
	conf.JsonPath = append(conf.JsonPath, path)
}
