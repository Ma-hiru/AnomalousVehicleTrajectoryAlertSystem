package app

import (
	"github.com/gin-gonic/gin"
	"log"
)

func RunConfig(app *gin.Engine) {
	var serverType string
	if isSSL {
		err = app.RunTLS(port, path.Fullchain, path.Privkey)
		serverType = "Https"
	} else {
		err = app.Run(port)
		serverType = "Http"
	}
	if err != nil {
		log.Fatalf("%s Server start fail at %s.Reason: %v", serverType, port, err)
	}
}
