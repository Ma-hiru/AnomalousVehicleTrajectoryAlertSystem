package socketServer

import "server/core/my_socketio"

const (
	JoinEvent  my_socketio.Event = "join"
	FrameEvent my_socketio.Event = "frame"
	MetaEvent  my_socketio.Event = "meta"
)

type JoinMsg struct {
	RoomID int `json:"roomID"`
}
type FrameMsg struct {
	StreamName string  `json:"streamName"`
	Timestamp  float64 `json:"timestamp"`
	Data       any     `json:"data"`
}
type MetaMsg struct {
	StreamName string  `json:"streamName"`
	Timestamp  float64 `json:"timestamp"`
	Data       any     `json:"data"`
}
