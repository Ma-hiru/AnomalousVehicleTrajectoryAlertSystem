package yolov8

import (
	"fmt"
	"google.golang.org/grpc"
	"server/settings"
)

var (
	YolovClient YoloServiceClient
	YolovConn   *grpc.ClientConn
	err         error
)

func Init() error {
	if YolovConn, err = grpc.NewClient(settings.YoloAddr, settings.YoloDialOptions...); err != nil {
		return fmt.Errorf("yolov8 rpc start failed: %v", err)
	} else {
		YolovClient = NewYoloServiceClient(YolovConn)
	}
	return nil
}
func Close() error {
	return YolovConn.Close()
}
