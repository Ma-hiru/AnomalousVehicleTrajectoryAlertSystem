package socketServer

import (
	"github.com/gin-gonic/gin"
	"server/core/gin_server"
	"server/core/my_socketio"
)

//func example() {
//	app := gin.Default()
//	app.Use(cors.New(cors.Config{
//		AllowAllOrigins: true,
//	}))
//	io := my_socketio.NewServer("/", app)
//	io.OnConnection = func(socket *my_socketio.Client) {
//		fmt.Println("连接成功")
//		socket.On(JoinEvent, func(data string) {
//			var message = JoinMsg{}
//			_ = json.Unmarshal([]byte(data), &message)
//			socket.Join(message.RoomId)
//		})
//		socket.On(CallEvent, func(data string) {
//			var message = BaseMsg{}
//			_ = json.Unmarshal([]byte(data), &message)
//			io.To(message.RoomId).Emit(CallEvent, data)
//		})
//	}
//	err := app.Run(":3000")
//	if err != nil {
//		log.Panicln(err)
//	}
//}

var FramesSocketIO *my_socketio.Server = nil

func FramesSocketInit() {
	gin_server.WithUse(func(app *gin.Engine) {
		FramesSocketIO = my_socketio.NewServer("/api/frames", app)
		FramesSocketIO.OnConnection = func(socket *my_socketio.Client) {
			socket.Join(socket.Name)
		}
	})
}
