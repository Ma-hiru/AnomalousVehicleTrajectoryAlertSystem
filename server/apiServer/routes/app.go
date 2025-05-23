package routes

import (
	"github.com/gin-gonic/gin"
	"os"
	"os/exec"
	"server/utils"
	"time"
)

func appRoutes(app *gin.RouterGroup) {
	app.POST("/restart", func(ctx *gin.Context) {
		utils.SuccessResponse(ctx, "app will restart in 2s", gin.H{
			"restart": true,
		})
		go func() {
			timer := time.NewTimer(2 * time.Second)
			select {
			case <-timer.C:
				exe, _ := os.Executable()
				cmd := exec.Command(exe, os.Args[1:]...)
				cmd.Stdout = os.Stdout
				cmd.Stderr = os.Stderr
				_ = cmd.Start()
				os.Exit(0)
			}
		}()
	})
	app.POST("/stop", func(ctx *gin.Context) {
		utils.SuccessResponse(ctx, "app will stop in 2s", gin.H{
			"stop": true,
		})
		go func() {
			timer := time.NewTimer(2 * time.Second)
			select {
			case <-timer.C:
				os.Exit(0)
			}
		}()
	})
}
