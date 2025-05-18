package gin_server

import (
	"github.com/gin-contrib/cors"
)

func setCors() {
	engine.Use(cors.New(corsConfig(isCors)))
}
