// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.36.6
// 	protoc        v4.25.3
// source: yolo.proto

package yolov8

import (
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
	reflect "reflect"
	sync "sync"
	unsafe "unsafe"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

type ImageRequest struct {
	state               protoimpl.MessageState `protogen:"open.v1"`
	ImageData           []byte                 `protobuf:"bytes,1,opt,name=imageData,proto3" json:"imageData,omitempty"`
	Width               *int32                 `protobuf:"varint,2,opt,name=width,proto3,oneof" json:"width,omitempty"`
	Height              *int32                 `protobuf:"varint,3,opt,name=height,proto3,oneof" json:"height,omitempty"`
	ConfidenceThreshold float32                `protobuf:"fixed32,4,opt,name=confidenceThreshold,proto3" json:"confidenceThreshold,omitempty"`
	unknownFields       protoimpl.UnknownFields
	sizeCache           protoimpl.SizeCache
}

func (x *ImageRequest) Reset() {
	*x = ImageRequest{}
	mi := &file_yolo_proto_msgTypes[0]
	ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
	ms.StoreMessageInfo(mi)
}

func (x *ImageRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*ImageRequest) ProtoMessage() {}

func (x *ImageRequest) ProtoReflect() protoreflect.Message {
	mi := &file_yolo_proto_msgTypes[0]
	if x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use ImageRequest.ProtoReflect.Descriptor instead.
func (*ImageRequest) Descriptor() ([]byte, []int) {
	return file_yolo_proto_rawDescGZIP(), []int{0}
}

func (x *ImageRequest) GetImageData() []byte {
	if x != nil {
		return x.ImageData
	}
	return nil
}

func (x *ImageRequest) GetWidth() int32 {
	if x != nil && x.Width != nil {
		return *x.Width
	}
	return 0
}

func (x *ImageRequest) GetHeight() int32 {
	if x != nil && x.Height != nil {
		return *x.Height
	}
	return 0
}

func (x *ImageRequest) GetConfidenceThreshold() float32 {
	if x != nil {
		return x.ConfidenceThreshold
	}
	return 0
}

type DetectionResult struct {
	state         protoimpl.MessageState `protogen:"open.v1"`
	Boxes         []*BoundingBox         `protobuf:"bytes,1,rep,name=boxes,proto3" json:"boxes,omitempty"`
	ProcessTimeMs int64                  `protobuf:"varint,2,opt,name=processTimeMs,proto3" json:"processTimeMs,omitempty"`
	unknownFields protoimpl.UnknownFields
	sizeCache     protoimpl.SizeCache
}

func (x *DetectionResult) Reset() {
	*x = DetectionResult{}
	mi := &file_yolo_proto_msgTypes[1]
	ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
	ms.StoreMessageInfo(mi)
}

func (x *DetectionResult) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*DetectionResult) ProtoMessage() {}

func (x *DetectionResult) ProtoReflect() protoreflect.Message {
	mi := &file_yolo_proto_msgTypes[1]
	if x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use DetectionResult.ProtoReflect.Descriptor instead.
func (*DetectionResult) Descriptor() ([]byte, []int) {
	return file_yolo_proto_rawDescGZIP(), []int{1}
}

func (x *DetectionResult) GetBoxes() []*BoundingBox {
	if x != nil {
		return x.Boxes
	}
	return nil
}

func (x *DetectionResult) GetProcessTimeMs() int64 {
	if x != nil {
		return x.ProcessTimeMs
	}
	return 0
}

type BoundingBox struct {
	state         protoimpl.MessageState `protogen:"open.v1"`
	XMin          float32                `protobuf:"fixed32,1,opt,name=xMin,proto3" json:"xMin,omitempty"`
	YMin          float32                `protobuf:"fixed32,2,opt,name=yMin,proto3" json:"yMin,omitempty"`
	XMax          float32                `protobuf:"fixed32,3,opt,name=xMax,proto3" json:"xMax,omitempty"`
	YMax          float32                `protobuf:"fixed32,4,opt,name=yMax,proto3" json:"yMax,omitempty"`
	Label         string                 `protobuf:"bytes,5,opt,name=label,proto3" json:"label,omitempty"`
	Confidence    float32                `protobuf:"fixed32,6,opt,name=confidence,proto3" json:"confidence,omitempty"`
	Mask          []byte                 `protobuf:"bytes,7,opt,name=mask,proto3,oneof" json:"mask,omitempty"`
	unknownFields protoimpl.UnknownFields
	sizeCache     protoimpl.SizeCache
}

func (x *BoundingBox) Reset() {
	*x = BoundingBox{}
	mi := &file_yolo_proto_msgTypes[2]
	ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
	ms.StoreMessageInfo(mi)
}

func (x *BoundingBox) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*BoundingBox) ProtoMessage() {}

func (x *BoundingBox) ProtoReflect() protoreflect.Message {
	mi := &file_yolo_proto_msgTypes[2]
	if x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use BoundingBox.ProtoReflect.Descriptor instead.
func (*BoundingBox) Descriptor() ([]byte, []int) {
	return file_yolo_proto_rawDescGZIP(), []int{2}
}

func (x *BoundingBox) GetXMin() float32 {
	if x != nil {
		return x.XMin
	}
	return 0
}

func (x *BoundingBox) GetYMin() float32 {
	if x != nil {
		return x.YMin
	}
	return 0
}

func (x *BoundingBox) GetXMax() float32 {
	if x != nil {
		return x.XMax
	}
	return 0
}

func (x *BoundingBox) GetYMax() float32 {
	if x != nil {
		return x.YMax
	}
	return 0
}

func (x *BoundingBox) GetLabel() string {
	if x != nil {
		return x.Label
	}
	return ""
}

func (x *BoundingBox) GetConfidence() float32 {
	if x != nil {
		return x.Confidence
	}
	return 0
}

func (x *BoundingBox) GetMask() []byte {
	if x != nil {
		return x.Mask
	}
	return nil
}

var File_yolo_proto protoreflect.FileDescriptor

const file_yolo_proto_rawDesc = "" +
	"\n" +
	"\n" +
	"yolo.proto\"\xab\x01\n" +
	"\fImageRequest\x12\x1c\n" +
	"\timageData\x18\x01 \x01(\fR\timageData\x12\x19\n" +
	"\x05width\x18\x02 \x01(\x05H\x00R\x05width\x88\x01\x01\x12\x1b\n" +
	"\x06height\x18\x03 \x01(\x05H\x01R\x06height\x88\x01\x01\x120\n" +
	"\x13confidenceThreshold\x18\x04 \x01(\x02R\x13confidenceThresholdB\b\n" +
	"\x06_widthB\t\n" +
	"\a_height\"[\n" +
	"\x0fDetectionResult\x12\"\n" +
	"\x05boxes\x18\x01 \x03(\v2\f.BoundingBoxR\x05boxes\x12$\n" +
	"\rprocessTimeMs\x18\x02 \x01(\x03R\rprocessTimeMs\"\xb5\x01\n" +
	"\vBoundingBox\x12\x12\n" +
	"\x04xMin\x18\x01 \x01(\x02R\x04xMin\x12\x12\n" +
	"\x04yMin\x18\x02 \x01(\x02R\x04yMin\x12\x12\n" +
	"\x04xMax\x18\x03 \x01(\x02R\x04xMax\x12\x12\n" +
	"\x04yMax\x18\x04 \x01(\x02R\x04yMax\x12\x14\n" +
	"\x05label\x18\x05 \x01(\tR\x05label\x12\x1e\n" +
	"\n" +
	"confidence\x18\x06 \x01(\x02R\n" +
	"confidence\x12\x17\n" +
	"\x04mask\x18\a \x01(\fH\x00R\x04mask\x88\x01\x01B\a\n" +
	"\x05_mask2w\n" +
	"\vYoloService\x121\n" +
	"\fDetectSingle\x12\r.ImageRequest\x1a\x10.DetectionResult\"\x00\x125\n" +
	"\fDetectStream\x12\r.ImageRequest\x1a\x10.DetectionResult\"\x00(\x010\x01B\n" +
	"Z\b.;yolov8b\x06proto3"

var (
	file_yolo_proto_rawDescOnce sync.Once
	file_yolo_proto_rawDescData []byte
)

func file_yolo_proto_rawDescGZIP() []byte {
	file_yolo_proto_rawDescOnce.Do(func() {
		file_yolo_proto_rawDescData = protoimpl.X.CompressGZIP(unsafe.Slice(unsafe.StringData(file_yolo_proto_rawDesc), len(file_yolo_proto_rawDesc)))
	})
	return file_yolo_proto_rawDescData
}

var file_yolo_proto_msgTypes = make([]protoimpl.MessageInfo, 3)
var file_yolo_proto_goTypes = []any{
	(*ImageRequest)(nil),    // 0: ImageRequest
	(*DetectionResult)(nil), // 1: DetectionResult
	(*BoundingBox)(nil),     // 2: BoundingBox
}
var file_yolo_proto_depIdxs = []int32{
	2, // 0: DetectionResult.boxes:type_name -> BoundingBox
	0, // 1: YoloService.DetectSingle:input_type -> ImageRequest
	0, // 2: YoloService.DetectStream:input_type -> ImageRequest
	1, // 3: YoloService.DetectSingle:output_type -> DetectionResult
	1, // 4: YoloService.DetectStream:output_type -> DetectionResult
	3, // [3:5] is the sub-list for method output_type
	1, // [1:3] is the sub-list for method input_type
	1, // [1:1] is the sub-list for extension type_name
	1, // [1:1] is the sub-list for extension extendee
	0, // [0:1] is the sub-list for field type_name
}

func init() { file_yolo_proto_init() }
func file_yolo_proto_init() {
	if File_yolo_proto != nil {
		return
	}
	file_yolo_proto_msgTypes[0].OneofWrappers = []any{}
	file_yolo_proto_msgTypes[2].OneofWrappers = []any{}
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: unsafe.Slice(unsafe.StringData(file_yolo_proto_rawDesc), len(file_yolo_proto_rawDesc)),
			NumEnums:      0,
			NumMessages:   3,
			NumExtensions: 0,
			NumServices:   1,
		},
		GoTypes:           file_yolo_proto_goTypes,
		DependencyIndexes: file_yolo_proto_depIdxs,
		MessageInfos:      file_yolo_proto_msgTypes,
	}.Build()
	File_yolo_proto = out.File
	file_yolo_proto_goTypes = nil
	file_yolo_proto_depIdxs = nil
}
