package my_socketio

import (
	"encoding/json"
	"github.com/gorilla/websocket"
	"server/utils"
	"sync"
	"time"
)

type Client struct {
	Name      string
	conn      *websocket.Conn
	roomID    string
	send      chan []byte
	events    map[string]func(data string)
	server    *Server
	sendMu    sync.Mutex
	closed    chan struct{}
	closeOnce sync.Once
}

func (c *Client) startHeartbeat() {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()
	for {
		select {
		case <-ticker.C:
			c.sendMu.Lock()
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				utils.Logger("socket").Printf("%v heartbeat lost:%v", c.Name, err)
				c.Close()
				c.sendMu.Unlock()
				return
			}
			c.sendMu.Unlock()
			_ = c.conn.SetReadDeadline(time.Now().Add(10 * time.Second))
			utils.Logger("socket").Printf("%v heartbeat", c.Name)
		}
	}
}
func (c *Client) readPump() {
	defer func() {
		if err := recover(); err != nil {
			utils.Logger("socket").Printf("readPump panic: %v", err)
		}
		c.Close()
	}()
loop:
	for {
		select {
		case <-c.closed:
			return
		default:
			_, message, err := c.conn.ReadMessage()
			if err != nil {
				if websocket.IsUnexpectedCloseError(err) {
					utils.Logger("socket").Printf("客户端异常断开: %v", err)
					//异常断开就无法恢复 直接退出
					break loop
				}
				utils.Logger("socket").Printf("readPump error: %v", err)
				break
			}
			var event Message
			if err = json.Unmarshal(message, &event); err == nil {
				if handler, ok := c.events[event.Event]; ok {
					go handler(event.Data)
				}
			}
		}
	}
}
func (c *Client) sendPump() {
	defer func() {
		if err := recover(); err != nil {
			utils.Logger("socket").Printf("sendPump panic: %v", err)
		}
		//sendPump 必须协程，退出时直接关闭连接
		c.Close()
	}()
	for {
		select {
		case <-c.closed:
			return
		default:
			for message := range c.send {
				//gorilla/websocket 库不支持并发写入
				c.sendMu.Lock()
				if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
					utils.Logger("socket").Printf("sendPump error: %v", err)
					//退出select 重新检查是否关闭，否则继续循环，直到panic
					break
				}
				c.sendMu.Unlock()
			}
		}
	}
}
func (c *Client) On(event Event, handler func(data string)) {
	c.events[string(event)] = handler
}
func (c *Client) Emit(event string, data string) {
	defer func() {
		if err := recover(); err != nil {
			utils.Logger("socket").Printf("emit panic: %v", err)
			//只有异常退出才关闭连接
			c.Close()
		}
	}()
	payload := Message{Event: event, Data: data}
	msg, _ := json.Marshal(payload)
	select {
	case <-c.closed:
		return
	default:
		c.send <- msg
	}
}
func (c *Client) Join(roomID string) {
	c.ExitRoom()
	c.server.mu.Lock()
	c.roomID = roomID
	if room, ok := c.server.rooms[roomID]; ok {
		room.Clients[c] = true
	} else {
		c.server.rooms[roomID] = &Room{Clients: map[*Client]bool{c: true}, roomID: roomID}
	}
	c.server.mu.Unlock()
}
func (c *Client) ExitRoom() {
	c.server.mu.Lock()
	if room, ok := c.server.rooms[c.roomID]; ok {
		delete(room.Clients, c)
		if len(room.Clients) == 0 {
			delete(c.server.rooms, c.roomID)
		}
	}
	c.server.mu.Unlock()
}
func (c *Client) Close() {
	defer func() {
		if err := recover(); err != nil {
			utils.Logger("socket").Printf("close panic: %v", err)
		}
	}()
	c.closeOnce.Do(func() {
		close(c.closed)
		close(c.send)
		_ = c.conn.Close()
		c.ExitRoom()
	})
}
