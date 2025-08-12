package mock

import (
	"fmt"
	"math/rand"
	"sync"
	"time"
)

// LicensePlateManager 车牌管理器
type LicensePlateManager struct {
	mu      sync.RWMutex
	mapping map[string]string
	used    map[string]bool
}

func (lpm *LicensePlateManager) generateLicensePlate(provinces, letters []string, rate float32) string {
	if provinces == nil || len(provinces) == 0 {
		provinces = defaultProvinces
	}
	if letters == nil || len(letters) == 0 {
		letters = defaultLetters
	}
	for {
		province := provinces[randGen.Intn(len(provinces))]
		region := letters[randGen.Intn(len(letters))]
		var number string
		for i := 0; i < 5; i++ {
			if rand.Float32() < rate {
				number += fmt.Sprintf("%d", rand.Intn(10))
			} else {
				number += letters[randGen.Intn(len(letters))]
			}
		}
		plate := province + region + number
		if !lpm.used[plate] {
			lpm.used[plate] = true
			return plate
		}
	}
}

func (lpm *LicensePlateManager) GetOrCreateLicensePlate(carId string, provinces, letters []string, rate float32) string {
	lpm.mu.RLock()
	if plate, exists := lpm.mapping[carId]; exists {
		lpm.mu.RUnlock()
		return plate
	}
	lpm.mu.RUnlock()
	lpm.mu.Lock()
	defer lpm.mu.Unlock()
	if plate, exists := lpm.mapping[carId]; exists {
		return plate
	}
	plate := lpm.generateLicensePlate(provinces, letters, rate)
	lpm.mapping[carId] = plate
	return plate
}

var plateManager *LicensePlateManager

var defaultProvinces = []string{"京", "津", "冀", "晋", "蒙", "辽", "吉", "黑", "沪", "苏", "浙", "皖", "闽", "赣", "鲁", "豫", "鄂", "湘", "粤", "桂", "琼", "渝", "川", "贵", "云", "藏", "陕", "甘", "青", "宁", "新"}

var defaultLetters = []string{"A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"}

var randGen *rand.Rand

func init() {
	plateManager = &LicensePlateManager{
		mapping: make(map[string]string),
		used:    make(map[string]bool),
	}
	seed := rand.NewSource(time.Now().UnixNano())
	randGen = rand.New(seed)
}
