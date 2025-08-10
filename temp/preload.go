package preload

import (
	"encoding/json"
	"fmt"
	"math"
	"os"
	"strings"
	"time"
)

// DetectionProcessor 检测数据处理器
type DetectionProcessor struct {
	data     *DetectionDataFile
	filePath string
}

// NewDetectionProcessor 创建新的检测数据处理器
func NewDetectionProcessor(jsonFilePath string) (*DetectionProcessor, error) {
	processor := &DetectionProcessor{
		filePath: jsonFilePath,
	}
	err := processor.loadData()
	if err != nil {
		return nil, fmt.Errorf("failed to load detection data: %v", err)
	}
	return processor, nil
}

// 加载JSON数据
func (dp *DetectionProcessor) loadData() error {
	content, err := os.ReadFile(dp.filePath)
	if err != nil {
		return fmt.Errorf("failed to read file: %v", err)
	}
	dp.data = &DetectionDataFile{}
	err = json.Unmarshal(content, dp.data)
	if err != nil {
		return fmt.Errorf("failed to parse JSON: %v", err)
	}
	return nil
}

// 打印元数据
func (dp *DetectionProcessor) printMeta() {
	fmt.Printf("成功加载检测数据: %s\n", dp.filePath)
	fmt.Printf("视频时长: %.1f秒\n", dp.data.VideoInfo.DurationSeconds)
	fmt.Printf("总帧数: %d\n", len(dp.data.Detections))
	fmt.Printf("总检测数: %d\n", dp.data.Statistics.TotalDetections)
	fmt.Printf("唯一车辆数: %d\n", dp.data.Statistics.UniqueVehicles)
}

// GetBehaviorDataByTime 根据播放时间获取对应的行为数据
func (dp *DetectionProcessor) GetBehaviorDataByTime(playTime float64) (*FrameData, error) {
	if dp.data == nil {
		return nil, fmt.Errorf("detection data not loaded")
	}

	// 检查时间范围
	if playTime < 0 {
		return nil, fmt.Errorf("play time cannot be negative: %.2f", playTime)
	}

	if playTime > dp.data.VideoInfo.DurationSeconds {
		return nil, fmt.Errorf("play time %.2f exceeds video duration %.2f",
			playTime, dp.data.VideoInfo.DurationSeconds)
	}

	// 查找最接近的帧
	closestFrame := dp.findClosestFrame(playTime)
	if closestFrame == nil {
		return nil, fmt.Errorf("no frame data found for time %.2f", playTime)
	}

	return closestFrame, nil
}

// 查找最接近指定时间的帧
func (dp *DetectionProcessor) findClosestFrame(targetTime float64) *FrameData {
	var closestFrame *FrameData
	minTimeDiff := math.MaxFloat64

	for i := range dp.data.Detections {
		frame := &dp.data.Detections[i]
		timeDiff := math.Abs(frame.Timestamp - targetTime)

		if timeDiff < minTimeDiff {
			minTimeDiff = timeDiff
			closestFrame = frame
		}
	}

	return closestFrame
}

// GetBehaviorDataByTimeRange 获取指定时间范围内的行为数据
func (dp *DetectionProcessor) GetBehaviorDataByTimeRange(startTime, endTime float64) ([]FrameData, error) {
	if dp.data == nil {
		return nil, fmt.Errorf("detection data not loaded")
	}

	if startTime < 0 || endTime < 0 {
		return nil, fmt.Errorf("time values cannot be negative")
	}

	if startTime > endTime {
		return nil, fmt.Errorf("start time %.2f cannot be greater than end time %.2f",
			startTime, endTime)
	}

	var frames []FrameData

	for _, frame := range dp.data.Detections {
		if frame.Timestamp >= startTime && frame.Timestamp <= endTime {
			frames = append(frames, frame)
		}
	}

	return frames, nil
}

// GetAnomalousBehaviorByTime 获取异常行为数据 (排除正常行为)
func (dp *DetectionProcessor) GetAnomalousBehaviorByTime(playTime float64) ([]Detection, error) {
	frameData, err := dp.GetBehaviorDataByTime(playTime)
	if err != nil {
		return nil, err
	}

	var anomalousDetections []Detection

	for _, detection := range frameData.Detections {
		// 过滤非正常行为 (action_id != 1)
		if detection.Behavior.ActionID != 1 {
			anomalousDetections = append(anomalousDetections, detection)
		}
	}

	return anomalousDetections, nil
}

// GetVehicleStats 获取车辆统计信息
func (dp *DetectionProcessor) GetVehicleStats() map[string]interface{} {
	if dp.data == nil {
		return nil
	}

	// 统计各种行为的数量
	behaviorStats := make(map[int]int)
	vehicleTypeStats := make(map[string]int)

	for _, frame := range dp.data.Detections {
		for _, detection := range frame.Detections {
			// 行为统计
			behaviorStats[detection.Behavior.ActionID]++
			// 车辆类型统计
			vehicleTypeStats[detection.ClassName]++
		}
	}

	return map[string]interface{}{
		"video_info":         dp.data.VideoInfo,
		"behavior_stats":     behaviorStats,
		"vehicle_type_stats": vehicleTypeStats,
		"total_detections":   dp.data.Statistics.TotalDetections,
		"unique_vehicles":    dp.data.Statistics.UniqueVehicles,
		"behavior_enum":      dp.data.BehaviorEnum,
	}
}

// Example 示例
func Example() {
	now := time.Now()
	fmt.Println(strings.Repeat("=", 50))
	// 创建处理器 (使用绝对路径)
	processor, err := NewDetectionProcessor("D:\\Project\\Vue+React\\AnomalousVehicleTrajectoryAlertSystem\\temp\\output\\detection_data.json")
	if err != nil {
		fmt.Printf(" 初始化失败: %v\n", err)
		return
	}

	// 测试用例1: 获取指定时间的行为数据
	testTime := 15.5 // 15.5秒
	fmt.Printf("\n 获取 %.1f 秒时的行为数据:\n", testTime)

	frameData, err := processor.GetBehaviorDataByTime(testTime)
	if err != nil {
		fmt.Printf(" 获取失败: %v\n", err)
	} else {
		fmt.Printf("  帧索引: %d\n", frameData.FrameIndex)
		fmt.Printf("  时间戳: %.2f秒\n", frameData.Timestamp)
		fmt.Printf("  车辆数: %d\n", len(frameData.Detections))

		for i, detection := range frameData.Detections {
			fmt.Printf("    车辆%d: %s - %s (置信度: %.2f)\n",
				i+1, detection.CarID, detection.Behavior.ActionName,
				detection.Behavior.Confidence)
		}
	}

	// 测试用例2: 获取异常行为
	fmt.Printf("\n获取 %.1f 秒时的异常行为:\n", testTime)

	anomalous, err := processor.GetAnomalousBehaviorByTime(testTime)
	if err != nil {
		fmt.Printf("获取失败: %v\n", err)
	} else {
		if len(anomalous) == 0 {
			fmt.Printf("  无异常行为\n")
		} else {
			for i, detection := range anomalous {
				fmt.Printf("  异常%d: %s - %s (严重度: %s)\n",
					i+1, detection.CarID, detection.Behavior.ActionName,
					getSeverityLevel(detection.Behavior.ActionID))
			}
		}
	}

	// 测试用例3: 获取时间范围数据
	startTime, endTime := 10.0, 20.0
	fmt.Printf("\n获取 %.1f-%.1f 秒时间段数据:\n", startTime, endTime)

	rangeFrames, err := processor.GetBehaviorDataByTimeRange(startTime, endTime)
	if err != nil {
		fmt.Printf("获取失败: %v\n", err)
	} else {
		totalVehicles := 0
		for _, frame := range rangeFrames {
			totalVehicles += len(frame.Detections)
		}
		fmt.Printf("  时间段帧数: %d\n", len(rangeFrames))
		fmt.Printf("  时间段内总检测数: %d\n", totalVehicles)
	}

	// 测试用例4: 获取统计信息
	fmt.Printf("\n车辆统计信息:\n")
	stats := processor.GetVehicleStats()
	if stats != nil {
		if behaviorStats, ok := stats["behavior_stats"].(map[int]int); ok {
			fmt.Printf("  行为分布:\n")
			for behaviorID, count := range behaviorStats {
				behaviorName := getBehaviorName(behaviorID)
				percentage := float64(count) / float64(stats["total_detections"].(int)) * 100
				fmt.Printf("    %d-%s: %d次 (%.1f%%)\n",
					behaviorID, behaviorName, count, percentage)
			}
		}
	}

	fmt.Printf("\n✅ 测试完成!")
	fmt.Printf(" 耗时: %.2f秒\n", time.Since(now).Seconds())
}
