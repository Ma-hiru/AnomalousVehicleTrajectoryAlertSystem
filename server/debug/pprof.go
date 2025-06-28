package debug

import (
	"github.com/gin-contrib/pprof"
	"github.com/gin-gonic/gin"
)
import "shiina-mahiru.cn/gin_server"

func PProf() {
	gin_server.WithUse(func(engine *gin.Engine) {
		pprof.Register(engine, pprof.DefaultPrefix)
	})
}
