package static

import (
	"github.com/gin-gonic/gin"
	"shiina-mahiru.cn/gin_server"
)

func UseStatic(app *gin.Engine) {
	//app.Static("/temp", "./www/temp")
}
func Init() {
	gin_server.WithUse(UseStatic)
}
