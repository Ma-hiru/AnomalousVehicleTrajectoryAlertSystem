package my_socketio

type Event string
type Role string

const (
	JoinEvent      Event = "join"
	OfferEvent     Event = "offer"
	AnswerEvent    Event = "answer"
	CandidateEvent Event = "candidate"
	CallEvent      Event = "call"
	AcceptEvent    Event = "accept"
	HangupEvent    Event = "hangup"
)

const (
	CallerRole Role = "caller"
	CalledRole Role = "called"
	AllRole    Role = "all"
)

type BaseMsg struct {
	Form   Role `json:"form"`
	To     Role `json:"to"`
	RoomId int  `json:"roomId"`
}
type JoinMsg struct {
	BaseMsg
}
