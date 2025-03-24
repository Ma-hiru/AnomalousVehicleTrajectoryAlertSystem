package middleware

import (
	"log"
	"net/http"
	"runtime/debug"
	"server/utils"

	"github.com/gin-gonic/gin"
)

func CustomRecovery(errMsg any) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("Recovered panic: %v\n%s", err, debug.Stack())
				utils.PrintStack()
				ctx.AbortWithStatusJSON(http.StatusInternalServerError, errMsg)
			}
		}()
		ctx.Next()
	}
}
