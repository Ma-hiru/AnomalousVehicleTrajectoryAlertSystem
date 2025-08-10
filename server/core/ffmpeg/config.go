package ffmpeg

type (
	SimulateInputOption struct {
		StreamLoop          string `json:"stream_loop"`         // 循环次数（-1为无限循环）
		Re                  string `json:"re"`                  // 实时流速度 (example "" )
		Threads             string `json:"threads"`             // 全局线程数
		Async               string `json:"async"`               // 音频同步阈值 (example "1" )
		Vsync               string `json:"vsync"`               // 视频同步方法 (example "1" )
		Hwaccel             string `json:"hwaccel"`             // CUDA硬件加速 (example "cuda"/"qsv" )
		HwaccelOutputFormat string `json:"hwaccelOutputFormat"` // 显存输出格式 (example "cuda"/"qsv" )
	}
	SimulateOutputOption struct {
		CV            string `json:"c:v"`            // NVIDIA编码器 (example "h264_nvenc"/"h264_qsv")
		Preset        string `json:"preset"`         // 编码预设档 (example "p6"/"veryfast")
		BV            string `json:"b:v"`            // 视频码率 (example "1500k")
		Maxrate       string `json:"maxrate"`        // 最大码率 (example "3000k")
		Bufsize       string `json:"bufsize"`        // 码率缓冲区 (example "6000k")
		R             string `json:"r"`              // 帧率 (example "30")
		G             string `json:"g"`              // GOP大小 (example "60")
		Bf            string `json:"bf"`             // B帧数量 (example "0")
		ProfileV      string `json:"profile:v"`      // H.264档次 (example "high")
		CA            string `json:"c:a"`            // 音频编码 (example "aac")
		BA            string `json:"b:a"`            // 音频码率 (example "128k")
		RtspTransport string `json:"rtsp_transport"` // RTSP传输协议 (example "tcp")
		TcpNodelay    string `json:"tcp_nodelay"`    // 禁用Nagle算法 (example "1")
		F             string `json:"f"`              // 输出格式 (example "rtsp")
	}
	RtspServerConfig struct {
		FilePath   string
		ConfigPath string
	}
	SimulateStreamsOptions struct {
		FilePath         string
		FileOutput       string
		RtspServerConfig RtspServerConfig
		InputOpt         SimulateInputOption
		OutputOpt        SimulateOutputOption
	}
)

type (
	ExtractInputOption struct {
		StreamLoop  int    // 循环次数（-1为无限循环）
		Fflags      string `json:"fflags"` // 生成PTS时间戳 "+genpts"
		StartTime   string // 起始时间 hh:mm:ss
		Duration    string // 抽帧时长 hh:mm:ss
		Hwaccel     string `json:"hwaccel"` // Hwaccel 硬件加速类型，可选值: "qsv", "cuda"
		CV          string `json:"c:v"`     // NVIDIA编码器 (example "h264_nvenc")
		InputFormat string `json:"f"`
		Loglevel    string `json:"loglevel"` //warning
	}
	ExtractOutputOption struct {
		FPS                      int    // 抽帧频率（帧/秒）
		Quality                  int    `json:"qscale:v"` // 图片质量 1-31（越低越好）
		SelectMode               string // 抽帧模式: all/keyframe
		FrameType                string // 帧类型: I/P/B（需SelectMode=keyframe）
		ImageFormat              string // 输出格式: jpg/png
		FpsMode                  string `json:"fps_mode"`                    //  可变帧率模式(vfr)
		OutputFormat             string `json:"f"`                           // 输出图片序列(image2)
		UseWallclockAsTimestamps string `json:"use_wallclock_as_timestamps"` // 应对时间戳异常 "1"
	}
	ExtractFramesOptions struct {
		Name           string
		InputPath      string
		InputOpt       ExtractInputOption
		OutputDir      string
		OutputTemplate string // 文件名模板（如frame_%04d.jpg）
		OutputOpt      ExtractOutputOption
	}
)

// FrameData 存储视频帧及其时间戳
type FrameData struct {
	Data      []byte  // 图片二进制数据
	Timestamp float64 // 帧的时间戳（秒）
	Index     int64   // 帧序号
}

// MetaData 视频帧及其时间戳信息
type MetaData struct {
	Timestamp float64 // 帧的时间戳（秒）
	Index     int64   // 帧序号
}
