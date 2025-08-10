package preload

var behaviors = map[int]string{
	1: "正常",
	2: "逆行",
	3: "超速",
	4: "变道",
	5: "占应急道",
	6: "低速",
	7: "停车",
}

// 获取行为严重级别
func getSeverityLevel(behaviorID int) string {
	switch behaviorID {
	case 2, 5: // 逆行，占应急道
		return "高危"
	case 3, 7: // 超速，停车
		return "中危"
	case 4, 6: // 变道，低速
		return "低危"
	default:
		return "正常"
	}
}

// 获取行为名称
func getBehaviorName(behaviorID int) string {
	if name, exists := behaviors[behaviorID]; exists {
		return name
	}
	return "未知"
}
