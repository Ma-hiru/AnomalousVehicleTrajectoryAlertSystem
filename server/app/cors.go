package app

import (
	"github.com/gin-contrib/cors"
)

func setCors() {
	engine.Use(cors.New(corsConfig))
}
