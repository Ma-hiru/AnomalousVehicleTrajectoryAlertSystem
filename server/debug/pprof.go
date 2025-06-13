package debug

import "github.com/gin-contrib/pprof"
import "server/core/gin_server"

func PProf() {
	engine := gin_server.GetEngine()
	pprof.Register(engine, pprof.DefaultPrefix)
}
