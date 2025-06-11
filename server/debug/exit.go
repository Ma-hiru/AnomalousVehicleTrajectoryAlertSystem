package debug

import (
	"github.com/fatih/color"
	"os"
	"os/signal"
	"server/utils"
	"syscall"
)

func ListenSignExit() {
	for {
		sigs := make(chan os.Signal, 1)
		signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)
		utils.Logger("debug").SetColor(color.FgRed).Println("exit with signal:", (<-sigs).String())
		os.Exit(114514)
	}
}
