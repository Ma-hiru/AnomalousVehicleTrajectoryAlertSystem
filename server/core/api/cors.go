package api

import (
	"github.com/gin-contrib/cors"
)

func setCors() {
	engine.Use(cors.New(corsConfig(isCors)))
}
