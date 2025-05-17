package my_socketio

import (
	"encoding/json"
	"fmt"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"log"
)

func example() {
	app := gin.Default()
	app.Use(cors.New(cors.Config{
		AllowAllOrigins: true,
	}))
	io := NewServer("/", app)
	io.OnConnection = func(socket *Client) {
		fmt.Println("连接成功")
		socket.On(JoinEvent, func(data string) {
			var message = JoinMsg{}
			_ = json.Unmarshal([]byte(data), &message)
			socket.Join(message.RoomId)
		})
		socket.On(CallEvent, func(data string) {
			var message = BaseMsg{}
			_ = json.Unmarshal([]byte(data), &message)
			io.To(message.RoomId).Emit(CallEvent, data)
		})
		socket.On(AcceptEvent, func(data string) {
			var message = BaseMsg{}
			_ = json.Unmarshal([]byte(data), &message)
			io.To(message.RoomId).Emit(AcceptEvent, data)
		})
		socket.On(OfferEvent, func(data string) {
			var message = BaseMsg{}
			_ = json.Unmarshal([]byte(data), &message)
			io.To(message.RoomId).Emit(OfferEvent, data)
		})
		socket.On(AnswerEvent, func(data string) {
			var message = BaseMsg{}
			_ = json.Unmarshal([]byte(data), &message)
			io.To(message.RoomId).Emit(AnswerEvent, data)
		})
		socket.On(CandidateEvent, func(data string) {
			var message = BaseMsg{}
			_ = json.Unmarshal([]byte(data), &message)
			io.To(message.RoomId).Emit(CandidateEvent, data)
		})
	}
	err := app.Run(":3000")
	if err != nil {
		log.Panicln(err)
	}
}
