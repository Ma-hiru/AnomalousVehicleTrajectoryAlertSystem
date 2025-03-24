package settings

import (
	"errors"
	"flag"
	"github.com/gin-gonic/gin"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"text/template"
)

var portFlag = flag.String("port", ":80", "端口号")
var sslFlag = flag.Bool("ssl", false, "是否开启ssl")
var chainFlag = flag.String("chain", defaultPemFilePath.Fullchain, "证书文件路径")
var keyFlag = flag.String("key", defaultPemFilePath.Privkey, "私钥文件路径")
var modeFlag = flag.String("mode", gin.DebugMode, "gin运行模式")
var corsFlag = flag.Bool("cors", true, "是否开启跨域")

func getParams(port *string, ok *bool, path *PemFilePath) error {
	portStr := strings.TrimPrefix(*portFlag, ":")
	if portNum, err := strconv.ParseInt(portStr, 10, 64); err != nil {
		return errors.New("port参数错误，请输入正确的端口号数值")
	} else {
		if portNum < 0 || portNum > 65535 {
			return errors.New("端口号范围不在0-65535之间")
		} else {
			*port = ":" + portStr
		}
	}
	path.Fullchain = *chainFlag
	path.Privkey = *keyFlag
	if file, err := os.Open(filepath.Join(path.Fullchain)); err != nil {
		return errors.New("证书文件路径错误")
	} else {
		err = file.Close()
		if err != nil {
			return errors.New("证书文件打开错误")
		}
	}
	if file, err := os.Open(filepath.Join(path.Privkey)); err != nil {
		return errors.New("私钥文件路径错误")
	} else {
		err = file.Close()
		if err != nil {
			return errors.New("私钥文件打开错误")
		}
	}
	*ok = *sslFlag
	return nil
}

func LoggerStartParams() {
	const templateStr = `--Start Param: 
	--isSSL=> {{.ssl}} 
	--port=> {{.port}} 
	--pemfile=> {{.pem}} 
	--keyfile=> {{.key}} 
	--mode=> {{.mode}}
	--cors=> {{.cors}}
`
	temp := template.Must(template.New("params").Parse(templateStr))
	if err := temp.Execute(os.Stdout, map[string]any{
		"ssl":  *sslFlag,
		"port": *portFlag,
		"pem":  *chainFlag,
		"key":  *keyFlag,
		"mode": *modeFlag,
		"cors": *corsFlag,
	}); err != nil {
		panic(err)
	}
}
