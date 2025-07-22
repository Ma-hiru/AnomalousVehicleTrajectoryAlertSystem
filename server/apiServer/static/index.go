package static

import (
	"github.com/gin-gonic/gin"
	"path/filepath"
	"shiina-mahiru.cn/gin_server"
)

func UseStatic(app *gin.Engine) {
	app.Static("/avtas", filepath.Join("./www"))
}
func Init() {
	gin_server.WithUse(UseStatic)
}
