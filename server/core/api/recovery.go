package api

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"os"
	"runtime"
	"runtime/debug"
)

func customRecovery(errMsg any) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("Recovered panic: %v\n%s", err, debug.Stack())
				if enablePrintStack {
					printStack()
				}
				ctx.AbortWithStatusJSON(http.StatusInternalServerError, errMsg)
			}
		}()
		ctx.Next()
	}
}
func printStack() {
	buf := make([]byte, 4096)
	fmt.Println("MainStackInfo:")
	n := runtime.Stack(buf, true)
	_, _ = os.Stdout.Write(buf[:n])
}
