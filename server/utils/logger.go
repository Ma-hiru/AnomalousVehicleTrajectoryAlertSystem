package utils

import (
	"github.com/fatih/color"
	"io"
	"time"
)

type Log struct {
	color  []color.Attribute
	fn     *color.Color
	prefix string
}

var DefaultColor = color.BgHiBlue

func Logger(prefix ...string) *Log {
	Instance := &Log{}
	Instance.color = []color.Attribute{color.Bold, DefaultColor}
	Instance.fn = color.New(Instance.color...)
	if len(prefix) == 0 {
		Instance.prefix = "LOG"
	} else {
		Instance.prefix = prefix[len(prefix)-1]
	}
	return Instance
}
func (l *Log) SetColor(Color color.Attribute) *Log {
	l.color = append(l.color, Color)
	l.fn = color.New(l.color...)
	return l
}
func (l *Log) Println(data ...any) {
	text := l.fn.PrintlnFunc()
	l.logTime()
	text(data...)
}
func (l *Log) SPrintln(data ...any) string {
	text := l.fn.SprintlnFunc()
	l.logTime()
	return text(data...)
}
func (l *Log) FPrintln(writer io.Writer, data ...any) {
	text := l.fn.FprintlnFunc()
	l.logTime()
	text(writer, data...)
}
func (l *Log) Printf(format string, data ...any) {
	text := l.fn.PrintfFunc()
	l.logTime()
	text(format, data...)
}
func (l *Log) SPrintf(format string, data ...any) string {
	text := l.fn.SprintfFunc()
	l.logTime()
	return text(format, data...)
}
func (l *Log) FPrintf(writer io.Writer, format string, data ...any) {
	text := l.fn.FprintfFunc()
	l.logTime()
	text(writer, format, data...)
}
func (l *Log) logTime() {
	text := l.fn.PrintfFunc()
	text("[%s] %s | ", l.prefix, time.Now().Format("2006/01/02 - 15:04:05"))
}
