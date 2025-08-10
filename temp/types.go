package preload

// BehaviorData 检测数据结构
type BehaviorData struct {
	ActionID    int     `json:"action_id"`
	ActionName  string  `json:"action_name"`
	Description string  `json:"description"`
	Confidence  float64 `json:"confidence"`
}

type BoundingBox struct {
	XCenter float64 `json:"x_center"`
	YCenter float64 `json:"y_center"`
	Width   float64 `json:"width"`
	Height  float64 `json:"height"`
}

type Detection struct {
	CarID      string       `json:"car_id"`
	BBox       BoundingBox  `json:"bbox"`
	Confidence float64      `json:"confidence"`
	ClassName  string       `json:"class_name"`
	Behavior   BehaviorData `json:"behavior"`
	Timestamp  float64      `json:"timestamp"`
}

type FrameData struct {
	FrameIndex int         `json:"frame_index"`
	Timestamp  float64     `json:"timestamp"`
	Detections []Detection `json:"detections"`
}

type VideoInfo struct {
	InputPath          string  `json:"input_path"`
	OutputPath         string  `json:"output_path"`
	OriginalResolution string  `json:"original_resolution"`
	OutputResolution   string  `json:"output_resolution"`
	FPS                float64 `json:"fps"`
	ProcessedFrames    int     `json:"processed_frames"`
	DurationSeconds    float64 `json:"duration_seconds"`
	ProcessingTime     float64 `json:"processing_time"`
}

type Statistics struct {
	TotalDetections    int     `json:"total_detections"`
	UniqueVehicles     int     `json:"unique_vehicles"`
	FramesWithVehicles int     `json:"frames_with_vehicles"`
	ProcessingFPS      float64 `json:"processing_fps"`
}

type BehaviorEnum struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type DetectionDataFile struct {
	VideoInfo    VideoInfo               `json:"video_info"`
	Detections   []FrameData             `json:"detections"`
	BehaviorEnum map[string]BehaviorEnum `json:"behavior_enum"`
	Statistics   Statistics              `json:"statistics"`
}
