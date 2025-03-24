package app

import (
	"github.com/gin-gonic/gin"
)

func CreateApp() (app *gin.Engine) {
	return gin.Default()
}
