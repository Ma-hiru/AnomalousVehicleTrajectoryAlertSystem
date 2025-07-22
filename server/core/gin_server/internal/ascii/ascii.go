package ascii

import (
	"github.com/gin-gonic/gin"
	"shiina-mahiru.cn/gin_server/pkg/conf"
	"strings"
)
import "text/template"

func DefaultAscii(opt conf.Options, name string, version string) string {
	tmp := `
███╗   ███╗ █████╗ ██╗  ██╗██╗██████╗ ██╗   ██╗ author  @Ma-hiru
████╗ ████║██╔══██╗██║  ██║██║██╔══██╗██║   ██║ name    {{.Name}}
██╔████╔██║███████║███████║██║██████╔╝██║   ██║ version {{.Version}}
██║╚██╔╝██║██╔══██║██╔══██║██║██╔══██╗██║   ██║ gin     {{.Gin}}
██║ ╚═╝ ██║██║  ██║██║  ██║██║██║  ██║╚██████╔╝ 
╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝ ╚═════╝  
 port  {{.Option.RunningPort}}               
 mode  {{.Option.RunningMode}}               
 SSL   {{.Option.SSL}}
 Key   {{.Option.Key}}
 Chain {{.Option.Chain}}
 Cors  {{.Option.CorsConf.AllowAllOrigins}}
`
	t := template.Must(template.New("").Parse(tmp))
	builder := strings.Builder{}
	_ = t.Execute(&builder, struct {
		Option  conf.Options
		Version string
		Gin     string
		Name    string
	}{
		Option:  opt,
		Gin:     gin.Version,
		Name:    name,
		Version: version,
	})
	return builder.String()
}
