package utils

import (
	"fmt"
	"time"
)

func GetTime(format string) string {
	now := time.Now()
	y, m, d := now.Date()
	hh, mm, ss := now.Clock()
	return fmt.Sprintf(format, y, m, d, hh, mm, ss)
}
