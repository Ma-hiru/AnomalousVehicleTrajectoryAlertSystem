package my_socketio

import (
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"sync"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

type Message struct {
	Event string `json:"event"`
	Data  string `json:"data"`
}
type Server struct {
	rooms        map[string]*Room
	mu           sync.RWMutex
	OnConnection func(socket *Client)
}

func (s *Server) To(roomID string) *Room {
	if room, ok := s.rooms[roomID]; ok {
		return room
	} else {
		return &Room{}
	}
}

func NewServer(path string, app *gin.Engine) *Server {
	var server = Server{
		rooms:        make(map[string]*Room),
		OnConnection: func(socket *Client) {},
	}
	app.POST(path, func(ctx *gin.Context) {
		name := ctx.Query("name")
		conn, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
		if err != nil {
			log.Println("连接升级失败:", err)
			return
		}
		client := &Client{
			Name:   name,
			conn:   conn,
			send:   make(chan []byte, 1024),
			events: make(map[string]func(data string)),
			server: &server,
		}
		go client.startHeartbeat()
		go client.readPump()
		go client.sendPump()
		server.OnConnection(client)
	})
	app.GET(path, func(ctx *gin.Context) {
		name := ctx.Query("name")
		conn, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
		if err != nil {
			log.Println("连接升级失败:", err)
			return
		}
		client := &Client{
			Name:   name,
			conn:   conn,
			send:   make(chan []byte, 1024),
			events: make(map[string]func(data string)),
			server: &server,
			closed: make(chan struct{}),
		}
		go client.startHeartbeat()
		go client.readPump()
		go client.sendPump()
		server.OnConnection(client)
	})
	return &server
}
