package stream_consumer

import (
	"fmt"
	"io"
	"sync"

	"server/go2rtc/pkg/core"

	"github.com/pion/rtp"
)

// VideoMetadata 简化的视频元数据结构
type VideoMetadata struct {
	Codec     *core.Codec // 编解码器信息
	Width     int         // 视频宽度
	Height    int         // 视频高度
	CodecData []byte      // 编解码器特定数据
}

// VideoProcessFn 定义视频处理函数类型
type VideoProcessFn func(reader *io.PipeReader, metadata *VideoMetadata, streamInfo map[string]interface{})

// AudioProcessFn 定义音频处理函数类型
type AudioProcessFn func(reader io.Reader, codec *core.Codec, streamInfo map[string]interface{})

// StreamConsumer 简化的流消费者实现
type StreamConsumer struct {
	medias     []*core.Media
	tracks     map[string]*core.Receiver
	mutex      sync.Mutex
	formatName string
	streamInfo map[string]interface{}

	// 管道
	videoPipeReader *io.PipeReader
	videoPipeWriter *io.PipeWriter

	// 处理函数
	videoProcessFn VideoProcessFn
	videoMeta      *VideoMetadata
}

// StreamConsumerOptions 配置选项
type StreamConsumerOptions struct {
	StreamName     string
	FormatName     string
	VideoProcessFn VideoProcessFn
}

// NewStreamConsumer 创建一个新的流消费者
func NewStreamConsumer(options *StreamConsumerOptions) *StreamConsumer {
	if options == nil {
		options = &StreamConsumerOptions{
			StreamName: "default",
			FormatName: "stream_consumer",
		}
	}
	// 创建基本流信息
	streamInfo := map[string]any{
		"name": options.StreamName,
	}
	// 创建视频管道
	videoPipeReader, videoPipeWriter := io.Pipe()
	return &StreamConsumer{
		tracks:          make(map[string]*core.Receiver),
		formatName:      options.FormatName,
		streamInfo:      streamInfo,
		videoPipeReader: videoPipeReader,
		videoPipeWriter: videoPipeWriter,
		videoProcessFn:  options.VideoProcessFn,
		videoMeta:       &VideoMetadata{},
	}
}

// GetMedias 返回支持的媒体类型
func (c *StreamConsumer) GetMedias() []*core.Media {
	if len(c.medias) == 0 {
		// 默认支持H264
		c.medias = []*core.Media{
			{
				Kind:      core.KindVideo,
				Direction: core.DirectionSendonly,
				Codecs: []*core.Codec{
					{Name: core.CodecH264},
				},
			},
		}
	}
	return c.medias
}

// AddTrack 添加媒体轨道
func (c *StreamConsumer) AddTrack(media *core.Media, codec *core.Codec, track *core.Receiver) error {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	// 只处理视频轨道
	if media.Kind == core.KindVideo {
		// 设置基本元数据
		c.videoMeta.Codec = codec
		// 创建发送器
		sender := core.NewSender(media, codec)
		sender.Handler = func(packet *rtp.Packet) {
			if c.videoPipeWriter != nil {
				_, _ = c.videoPipeWriter.Write(packet.Payload)
			}
		}
		// 连接轨道
		sender.HandleRTP(track)
		// 保存轨道引用
		key := media.Kind + "/" + codec.Name
		c.tracks[key] = track
		// 启动处理协程
		if c.videoProcessFn != nil {
			go c.videoProcessFn(c.videoPipeReader, c.videoMeta, c.streamInfo)
		}
	}

	return nil
}

// Stop 停止消费者
func (c *StreamConsumer) Stop() error {
	fmt.Println("stop")
	c.mutex.Lock()
	defer c.mutex.Unlock()
	// 关闭管道
	if c.videoPipeWriter != nil {
		_ = c.videoPipeWriter.Close()
		c.videoPipeWriter = nil
	}
	// 清除轨道引用
	c.tracks = make(map[string]*core.Receiver)
	return nil
}

// WriteTo 实现io.WriterTo接口
func (c *StreamConsumer) WriteTo(w io.Writer) (n int64, err error) {
	// 被动实现，仅用于兼容性
	return 0, nil
}
