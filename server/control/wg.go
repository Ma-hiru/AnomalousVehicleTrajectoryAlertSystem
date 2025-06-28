package control

import (
	"fmt"
	"github.com/fatih/color"
	"server/core/functional"
	"server/utils"
	"strconv"
	"sync"
	"time"
)

func WrapWg(wg *sync.WaitGroup, goroutine map[string]func()) map[string]bool {
	started := map[string]bool{}
	lock := sync.Mutex{}
	maxNameLen := 0
	utils.Logger("MAIN").Println("Waiting Start...")
	for name, routine := range goroutine {
		if len(name) > maxNameLen {
			maxNameLen = len(name)
		}
		go func() {
			lock.Lock()
			started[name] = true
			lock.Unlock()
			wg.Add(1)
			defer wg.Done()
			defer func() {
				if err := recover(); err != nil {
					utils.Logger("MAIN").SetColor(color.FgRed).Printf("Get [%v] panic: %v", name, err)
				}
				lock.Lock()
				started[name] = false
				PrintRoutineInfo(started, maxNameLen, "Goroutines Changes: "+name+" has closed.")
				lock.Unlock()
			}()
			routine()
		}()
	}
	time.Sleep(time.Second * 3)
	PrintRoutineInfo(
		started,
		maxNameLen,
		fmt.Sprintf(
			"Total goroutines: %d (closed %d)",
			len(started),
			functional.MapReduce(
				started,
				func(pre int, curKey string, curValue bool) int {
					if !curValue {
						return pre + 1
					}
					return pre
				},
				0,
			),
		),
	)
	return started
}

func PrintRoutineInfo(started map[string]bool, maxNameLen int, tips string) {
	utils.Logger("MAIN").SetColor(color.FgRed).Println(tips)
	functional.MapForEach(started, func(name string, status bool) {
		if status {
			utils.Logger("MAIN").Printf("%-"+strconv.Itoa(maxNameLen)+"s   ->running", name)
		} else {
			utils.Logger("MAIN").Printf("%-"+strconv.Itoa(maxNameLen)+"s   ->closed", name)
		}
	})

}
