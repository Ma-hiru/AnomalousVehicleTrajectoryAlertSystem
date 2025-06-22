# --go_out=. Protobuf 消息代码
# --go-grpc_out=. gRPC 服务代码
protoc `
--go_out=. `
--go-grpc_out=. `
yolo.proto