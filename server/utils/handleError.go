package utils

import (
	"fmt"
	"os"
	"runtime"
)

func PrintStack() {
	buf := make([]byte, 4096)
	fmt.Println("MainStackInfo:")
	n := runtime.Stack(buf, true)
	_, _ = os.Stdout.Write(buf[:n])
}
