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

var (
plateManager *LicensePlateManager
once         sync.Once
)

// GetLicensePlateManager 获取单例
func GetLicensePlateManager() *LicensePlateManager {
once.Do(func() {
plateManager = &LicensePlateManager{
mapping: make(map[string]string),
used:    make(map[string]bool),
}
})
return plateManager
}

var provinces = []string{"京", "津", "冀", "晋", "蒙", "辽", "吉", "黑", "沪", "苏", "浙", "皖", "闽", "赣", "鲁", "豫", "鄂", "湘", "粤", "桂", "琼", "渝", "川", "贵", "云", "藏", "陕", "甘", "青", "宁", "新"}
var letters = []string{"A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"}

func (lpm *LicensePlateManager) generateLicensePlate() string {
for {
province := provinces[rand.Intn(len(provinces))]
region := letters[rand.Intn(len(letters))]
var number string
for i := 0; i < 5; i++ {
if rand.Float32() < 0.7 {
number += fmt.Sprintf("%d", rand.Intn(10))
} else {
number += letters[rand.Intn(len(letters))]
}
}
plate := province + region + number
if !lpm.used[plate] {
lpm.used[plate] = true
return plate
}
}
}

func (lpm *LicensePlateManager) generateNingboLicensePlate() string {
for {
province := "浙"
regions := []string{"B", "U"}
region := regions[rand.Intn(len(regions))]
var number string
for i := 0; i < 5; i++ {
if rand.Float32() < 0.8 {
number += fmt.Sprintf("%d", rand.Intn(10))
} else {
number += letters[rand.Intn(len(letters))]
}
}
plate := province + region + number
if !lpm.used[plate] {
lpm.used[plate] = true
return plate
}
}
}

func (lpm *LicensePlateManager) GetOrCreateLicensePlate(carId string) string {
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
plate := lpm.generateLicensePlate()
lpm.mapping[carId] = plate
return plate
}

func (lpm *LicensePlateManager) GetOrCreateNingboLicensePlate(carId string) string {
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
plate := lpm.generateNingboLicensePlate()
lpm.mapping[carId] = plate
return plate
}

func PrintLicensePlateMapping() {
manager := GetLicensePlateManager()
manager.mu.RLock()
defer manager.mu.RUnlock()
fmt.Printf("=== 车牌号映射表 (%d条记录) ===\n", len(manager.mapping))
for carId, plate := range manager.mapping {
fmt.Printf("原始ID: %s -> 车牌号: %s\n", carId, plate)
}
fmt.Println("==========================")
}

func init() {
rand.Seed(time.Now().UnixNano())
}
