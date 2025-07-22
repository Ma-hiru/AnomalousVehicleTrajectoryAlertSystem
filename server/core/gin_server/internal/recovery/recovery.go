package recovery

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"os"
	"runtime"
)

func CustomRecovery(errMsg any, enablePrintStack bool) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("Gin Recovered panic: %v\n", err)
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
