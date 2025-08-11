package mock

import (
"fmt"
"testing"
)

func TestLicensePlateGeneration(t *testing.T) {
manager := GetLicensePlateManager()

// 测试全国车牌生成
fmt.Println("=== 测试全国车牌生成 ===")
for i := 0; i < 3; i++ {
carId := fmt.Sprintf("car%03d", i+1)
plate := manager.GetOrCreateLicensePlate(carId)
fmt.Printf("CarID: %s -> 车牌: %s\n", carId, plate)

// 验证全国车牌格式（省份简称1位 + 地区代码1位 + 号码5位 = 7位）
if len([]rune(plate)) != 7 {
t.Errorf("全国车牌长度错误: %s (长度: %d)", plate, len([]rune(plate)))
}
}

// 测试宁波车牌生成
fmt.Println("\n=== 测试宁波车牌生成 ===")
for i := 0; i < 3; i++ {
carId := fmt.Sprintf("ningbo_car%03d", i+1)
plate := manager.GetOrCreateNingboLicensePlate(carId)
fmt.Printf("CarID: %s -> 宁波车牌: %s\n", carId, plate)

// 验证宁波车牌格式
plateRunes := []rune(plate)
if len(plateRunes) != 7 {
t.Errorf("宁波车牌长度错误: %s (长度: %d)", plate, len(plateRunes))
}
if string(plateRunes[0]) != "浙" {
t.Errorf("宁波车牌省份错误: %s", plate)
}
regionCode := string(plateRunes[1])
if regionCode != "B" && regionCode != "U" {
t.Errorf("宁波车牌地区代码错误: %s", plate)
}
}

// 验证一致性
fmt.Println("\n=== 验证映射一致性 ===")
testCarId := "consistency_test"
plate1 := manager.GetOrCreateLicensePlate(testCarId)
plate2 := manager.GetOrCreateLicensePlate(testCarId)
if plate1 != plate2 {
t.Errorf("映射不一致: %s != %s", plate1, plate2)
} else {
fmt.Printf("一致性验证通过: %s -> %s\n", testCarId, plate1)
}

fmt.Println("\n=== 打印所有映射 ===")
PrintLicensePlateMapping()
}
