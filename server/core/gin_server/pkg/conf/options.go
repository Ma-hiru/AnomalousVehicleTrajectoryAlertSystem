package conf

import (
	"fmt"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"strings"
	"time"
)

type Mode string

func (m *Mode) UnmarshalJSON(data []byte) error {
	mode := string(data)
	*m = Mode(strings.ReplaceAll(mode, "\"", ""))
	return nil
}

const (
	ModeRelease Mode = gin.ReleaseMode
	ModeDebug   Mode = gin.DebugMode
	ModeTest    Mode = gin.TestMode
)

type CorsConfig struct {
	AllowAllOrigins           bool     `json:"allow_all_origins,omitempty"`
	AllowOrigins              []string `json:"allow_origins,omitempty"`
	AllowMethods              []string `json:"allow_methods,omitempty"`
	AllowPrivateNetwork       bool     `json:"allow_private_network,omitempty"`
	AllowHeaders              []string `json:"allow_headers,omitempty"`
	AllowCredentials          bool     `json:"allow_credentials,omitempty"`
	ExposeHeaders             []string `json:"expose_headers,omitempty"`
	MaxAge                    int64    `json:"max_age,omitempty"`
	AllowWildcard             bool     `json:"allow_wildcard,omitempty"`
	AllowBrowserExtensions    bool     `json:"allow_browser_extensions,omitempty"`
	CustomSchemas             []string `json:"custom_schemas,omitempty"`
	AllowWebSockets           bool     `json:"allow_web_sockets,omitempty"`
	AllowFiles                bool     `json:"allow_files,omitempty"`
	OptionsResponseStatusCode int      `json:"options_response_status_code,omitempty"`
}

func (c *CorsConfig) ConvertToGinCors() cors.Config {
	return cors.Config{
		AllowAllOrigins:           c.AllowAllOrigins,
		AllowOrigins:              c.AllowOrigins,
		AllowMethods:              c.AllowMethods,
		AllowHeaders:              c.AllowHeaders,
		AllowCredentials:          c.AllowCredentials,
		ExposeHeaders:             c.ExposeHeaders,
		MaxAge:                    time.Duration(c.MaxAge),
		AllowPrivateNetwork:       false,
		AllowWildcard:             false,
		AllowBrowserExtensions:    c.AllowBrowserExtensions,
		CustomSchemas:             c.CustomSchemas,
		AllowWebSockets:           c.AllowWebSockets,
		AllowFiles:                c.AllowFiles,
		OptionsResponseStatusCode: c.OptionsResponseStatusCode,
	}
}

type Options struct {
	RunningPort    *int              `json:"port"`
	RunningMode    *Mode             `json:"mode"`
	PrintStack     *bool             `json:"stack"`
	CorsConf       *CorsConfig       `json:"cors"`
	InternalErrMsg map[string]any    `json:"internal_err_msg"`
	Ascii          func(opt Options) `json:"ascii,omitempty"`
	Key            *string           `json:"key"`
	Chain          *string           `json:"chain"`
	SSL            *bool             `json:"ssl"`
}

func (o Options) String() string {
	return fmt.Sprintf("options=> \n mode: %s\n port: %d\n chain: %s\n key: %s\n ssl: %t\n stack: %t\n cors: %v\n internalErrMsg: %v\n",
		*o.RunningMode, *o.RunningPort, *o.Chain, *o.Key, *o.SSL, *o.PrintStack, o.CorsConf, o.InternalErrMsg)
}

var DefaultInternalErrMsg = gin.H{
	"code":    500,
	"message": "服务器错误",
	"ok":      false,
	"data":    nil,
}
var DefaultCorsConf = CorsConfig{
	AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"},
	AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
	AllowCredentials: true,
	AllowAllOrigins:  true,
	MaxAge:           int64(12 * time.Hour),
	AllowOrigins:     []string{},
	ExposeHeaders:    []string{"Content-Length"},
}
var DefaultPort = 80
var DefaultPrintStack = true
var DefaultMode = ModeDebug
var DefaultKeyPath = "./privkey.pem"
var DefaultCertPath = "./fullchain.pem"
var DefaultSSLStatus = false

var DefaultOptions = Options{
	RunningPort:    &DefaultPort,
	RunningMode:    &DefaultMode,
	PrintStack:     &DefaultPrintStack,
	CorsConf:       &DefaultCorsConf,
	InternalErrMsg: DefaultInternalErrMsg,
	Ascii:          nil,
	Key:            &DefaultKeyPath,
	Chain:          &DefaultCertPath,
	SSL:            &DefaultSSLStatus,
}
