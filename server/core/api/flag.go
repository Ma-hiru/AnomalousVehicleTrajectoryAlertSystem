package api

import (
	"errors"
	"flag"
	"github.com/fatih/color"
	"github.com/gin-gonic/gin"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"text/template"
)

var (
	portFlag  = flag.String("port", ":80", "端口号")
	sslFlag   = flag.Bool("ssl", false, "是否开启ssl")
	chainFlag = flag.String("chain", defaultPemFilePath.Fullchain, "证书文件路径")
	keyFlag   = flag.String("key", defaultPemFilePath.Privkey, "私钥文件路径")
	modeFlag  = flag.String("mode", gin.DebugMode, "gin运行模式")
	corsFlag  = flag.Bool("cors", true, "是否开启跨域")
)

func init() {
	flag.Parse()
}

func getParams(port *string, ok *bool, path *pemFilePath, cors *bool) error {
	*ok = *sslFlag
	*cors = *corsFlag
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
	if !*ok {
		return nil
	}
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
	return nil
}

func loggerStartParams() {
	var templateStr = `--Start Param: 
	--isSSL=> {{.ssl}} 
	--port=> {{.port}} 
	--pemfile=> {{.pem}} 
	--keyfile=> {{.key}} 
	--mode=> {{.mode}}
	--cors=> {{.cors}}
`
	templateStr = color.New(color.FgMagenta, color.Bold).Sprint(templateStr)
	temp := template.Must(template.New("params").Parse(templateStr))
	if err := temp.Execute(os.Stdout, map[string]any{
		"ssl":  isSSL,
		"port": port,
		"pem":  path.Fullchain,
		"key":  path.Privkey,
		"mode": mode,
		"cors": isCors,
	}); err != nil {
		panic(err)
	}
}
