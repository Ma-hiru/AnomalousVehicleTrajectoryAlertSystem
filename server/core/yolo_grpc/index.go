package yolov8

import (
	"context"
	"fmt"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"server/mock"
)

// YoloClient YoloService通信的客户端
type YoloClient struct {
	conn   *grpc.ClientConn
	client YoloServiceClient
}

// newClient 创建一个新的YoloService客户端
func newClient(serverAddr string) (*YoloClient, error) {
	options := []grpc.DialOption{
		grpc.WithTransportCredentials(insecure.NewCredentials()),
	}
	conn, err := grpc.NewClient(serverAddr, options...)
	if err != nil {
		return nil, err
	}
	client := NewYoloServiceClient(conn)
	return &YoloClient{
		conn:   conn,
		client: client,
	}, nil
}

// Close 关闭客户端连接
func (c *YoloClient) Close() error {
	if c.conn != nil {
		return c.conn.Close()
	}
	return nil
}

// DetectSingle 发送单个图像检测请求
func (c *YoloClient) DetectSingle(ctx context.Context, request *ImageRequest) (*DetectionResult, error) {
	return c.client.DetectSingle(ctx, request)
}

var yolo *YoloClient

func Init() {
	//var err error
	//yolo, err = newClient(":50051")
	//if err != nil {
	//	panic(err)
	//} else {
	//	fmt.Println("Yolo client initialized")
	//}
	mock.ClearAll()
	fmt.Println("Yolo client initialized")
}
func GetClient() *YoloClient {
	return yolo
}
