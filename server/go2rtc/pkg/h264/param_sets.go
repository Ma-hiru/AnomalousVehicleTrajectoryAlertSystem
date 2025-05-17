package h264

import (
	"encoding/base64"
)

// DecodeParamSet 解码Base64编码的参数集（SPS或PPS）
func DecodeParamSet(data string) ([]byte, error) {
	return base64.StdEncoding.DecodeString(data)
}

// 常用SPS/PPS组合 - 添加常见分辨率的SPS/PPS
var (
	// 1080p (1920x1080) 基准配置文件
	SPS1080p = "Z2QAH6zZQFAFuwFqAAADACAAAAMBlKA="
	PPS1080p = "aO48sA=="

	// 720p (1280x720) 基准配置文件
	SPS720p = "Z2QAKKwa0AoAt03AQEBQAAADABAAAAMB6PFCKg=="
	PPS720p = "aO48sA=="

	// 480p (854x480) 基准配置文件
	SPS480p = "Z2QAFqwa0BQF/yzcBAQFAAADAAEAAAMAHo8UIqA="
	PPS480p = "aO48sA=="
)

// GetDefaultCodecData 获取指定分辨率的默认编解码器数据
func GetDefaultCodecData(width, height int) []byte {
	var spsBase64, ppsBase64 string

	// 根据分辨率选择合适的SPS/PPS
	if width >= 1920 || height >= 1080 {
		spsBase64, ppsBase64 = SPS1080p, PPS1080p
	} else if width >= 1280 || height >= 720 {
		spsBase64, ppsBase64 = SPS720p, PPS720p
	} else {
		spsBase64, ppsBase64 = SPS480p, PPS480p
	}

	sps, _ := DecodeParamSet(spsBase64)
	pps, _ := DecodeParamSet(ppsBase64)

	if len(sps) > 0 && len(pps) > 0 {
		return JoinNALU(sps, pps)
	}

	return nil
}
