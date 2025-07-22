package start

import (
	"dario.cat/mergo"
	"fmt"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"os"
	"path/filepath"
	"shiina-mahiru.cn/gin_server/internal/ascii"
	log "shiina-mahiru.cn/gin_server/internal/logger"
	"shiina-mahiru.cn/gin_server/internal/recovery"
	"shiina-mahiru.cn/gin_server/pkg/conf"
	"shiina-mahiru.cn/gin_server/pkg/logger"
)

type ConfigEngine struct {
	Engine   *gin.Engine
	Settings *conf.Options
	Name     string
	Version  string
}

func NewConfigEngine(mode *conf.Mode, name string, version string) *ConfigEngine {
	if mode != nil {
		switch *mode {
		case conf.ModeDebug:
			gin.SetMode(string(conf.ModeDebug))
		case conf.ModeRelease:
			gin.SetMode(string(conf.ModeRelease))
		case conf.ModeTest:
			gin.SetMode(string(conf.ModeTest))
		default:
			logger.New("GIN").Println("unknown mode:", *mode)
		}
	}
	return &ConfigEngine{
		Engine:   gin.New(),
		Name:     name,
		Version:  version,
		Settings: nil,
	}
}
func (c *ConfigEngine) ApplySettings(settings conf.Options) *ConfigEngine {
	defaultSettings := conf.DefaultOptions
	c.Settings = &defaultSettings
	if err := mergo.Merge(c.Settings, settings, mergo.WithOverride); err != nil {
		logger.New("GIN").Println("settings merge err.", err)
		c.Settings = &conf.DefaultOptions
	}
	c.Engine.Use(
		gin.Logger(),
		log.CustomLogger,
		gin.Recovery(),
		recovery.CustomRecovery(c.Settings.InternalErrMsg, *c.Settings.PrintStack),
	)
	c.Engine.Use(cors.New(c.Settings.CorsConf.ConvertToGinCors()))
	return c
}
func (c *ConfigEngine) ApplyWithUse(withUse []func(engine *gin.Engine)) *ConfigEngine {
	for _, fn := range withUse {
		fn(c.Engine)
	}
	return c
}
func (c *ConfigEngine) isHttps() bool {
	if *c.Settings.RunningPort < 0 {
		port := conf.DefaultPort
		c.Settings.RunningPort = &port
	}
	if *c.Settings.SSL == false {
		return false
	} else {
		ok := true
		if *c.Settings.Chain == "" {
			cert := conf.DefaultCertPath
			c.Settings.Chain = &cert
		}
		if *c.Settings.Key == "" {
			key := conf.DefaultKeyPath
			c.Settings.Key = &key
		}
		if _, err := os.Stat(filepath.Join(*c.Settings.Chain)); os.IsNotExist(err) {
			logger.New("GIN").Println("ssl chain file not found")
			ok = false
		}
		if _, err := os.Stat(filepath.Join(*c.Settings.Key)); os.IsNotExist(err) {
			logger.New("GIN").Println("ssl key file not found")
			ok = false
		}
		return ok
	}
}
func (c *ConfigEngine) Run() {
	if c.isHttps() {
		if c.Settings.Ascii != nil {
			c.Settings.Ascii(*c.Settings)
		} else {
			logger.New().OffTime().Println(ascii.DefaultAscii(*c.Settings, c.Name, c.Version))
		}
		err := c.Engine.RunTLS(fmt.Sprintf(":%d", *c.Settings.RunningPort), *c.Settings.Chain, *c.Settings.Key)
		if err != nil {
			logger.New("GIN").Panic(err.Error())
		}
	} else {
		if c.Settings.Ascii != nil {
			c.Settings.Ascii(*c.Settings)
		} else {
			logger.New().OffTime().Println(ascii.DefaultAscii(*c.Settings, c.Name, c.Version))
		}
		err := c.Engine.Run(fmt.Sprintf(":%d", *c.Settings.RunningPort))
		if err != nil {
			logger.New("GIN").Panic(err.Error())
		}
	}
}
