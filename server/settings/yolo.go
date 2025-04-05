package settings

import (
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

var (
	YoloAddr        string            = ""
	YoloDialOptions []grpc.DialOption = []grpc.DialOption{
		grpc.WithTransportCredentials(insecure.NewCredentials()),
	}
)
