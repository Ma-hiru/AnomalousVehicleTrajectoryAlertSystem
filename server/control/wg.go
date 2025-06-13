package control

import (
	"fmt"
	"github.com/fatih/color"
	"path"
	"runtime"
	"server/utils"
	"strconv"
	"sync"
	"time"
)

func GetCurrentFuncName() (baseName string, fullName string) {
	pc, _, _, ok := runtime.Caller(0) // 0 表示当前函数
	if !ok {
		return "UNKNOWN", "UNKNOWN"
	}
	funcName := runtime.FuncForPC(pc).Name()
	return path.Base(funcName), funcName
}

type Map struct {
	mapData map[string]bool
}

func (m *Map) ForEach(callback func(key string, value bool)) {
	for key, value := range m.mapData {
		callback(key, value)
	}
}
func (m *Map) Reduce(callback func(pre any, curKey string, curValue bool) any, init any) any {
	for key, value := range m.mapData {
		init = callback(init, key, value)
	}
	return init
}

func WrapWg(wg *sync.WaitGroup, goroutine map[string]func()) *Map {
	started := Map{mapData: map[string]bool{}}
	lock := sync.Mutex{}
	maxNameLen := 0
	utils.Logger("MAIN").Println("Waiting Start...")
	for name, routine := range goroutine {
		if len(name) > maxNameLen {
			maxNameLen = len(name)
		}
		go func() {
			lock.Lock()
			started.mapData[name] = true
			lock.Unlock()
			wg.Add(1)
			defer wg.Done()
			defer func() {
				if err := recover(); err != nil {
					utils.Logger("MAIN").SetColor(color.FgRed).Printf("Get panic: %v", err)
				}
				lock.Lock()
				started.mapData[name] = false
				PrintRoutineInfo(&started, maxNameLen, "Goroutines Changes: "+name+" has closed.")
				lock.Unlock()
			}()
			routine()
		}()
	}
	time.Sleep(time.Second * 3)
	PrintRoutineInfo(
		&started,
		maxNameLen,
		fmt.Sprintf(
			"Total goroutines: %d (closed %d)",
			len(started.mapData),
			started.Reduce(func(pre any, curKey string, curValue bool) any {
				if !curValue {
					return pre.(int) + 1
				}
				return pre.(int)
			}, 0).(int),
		),
	)
	return &started
}

func PrintRoutineInfo(started *Map, maxNameLen int, tips string) {
	utils.Logger("MAIN").SetColor(color.FgRed).Println(tips)
	started.ForEach(func(name string, status bool) {
		if status {
			utils.Logger("MAIN").Printf("%-"+strconv.Itoa(maxNameLen)+"s   ->running", name)
		} else {
			utils.Logger("MAIN").Printf("%-"+strconv.Itoa(maxNameLen)+"s   ->closed", name)
		}
	})
}
