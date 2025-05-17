package my_socketio

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/websocket"
	"sync"
	"time"
)

type Client struct {
	conn   *websocket.Conn
	roomID int
	send   chan []byte
	events map[string]func(data string)
	server *Server
	sendMu sync.Mutex
}

func (c *Client) startHeartbeat() {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()
	for {
		select {
		case <-ticker.C:
			fmt.Println("heart test")
			c.sendMu.Lock()
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				fmt.Println("heart lost:", err)
				close(c.send)
				_ = c.conn.Close()
				c.sendMu.Lock()
				return
			}
			c.sendMu.Unlock()
			_ = c.conn.SetReadDeadline(time.Now().Add(10 * time.Second))
		}
	}
}
func (c *Client) readPump() {
	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
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
func (c *Client) sendPump() {
	for message := range c.send {
		//gorilla/websocket 库不支持并发写入
		c.sendMu.Lock()
		if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
			break
		}
		c.sendMu.Unlock()
	}
}
func (c *Client) On(event Event, handler func(data string)) {
	c.events[string(event)] = handler
}
func (c *Client) Emit(event string, data string) {
	payload := Message{Event: event, Data: data}
	msg, _ := json.Marshal(payload)
	c.send <- msg
}
func (c *Client) Join(roomID int) {
	c.server.mu.Lock()
	if room, ok := c.server.rooms[c.roomID]; ok {
		delete(room.Clients, c)
		if len(room.Clients) == 0 {
			delete(c.server.rooms, c.roomID)
		}
	}
	c.roomID = roomID
	if room, ok := c.server.rooms[roomID]; ok {
		room.Clients[c] = true
	} else {
		c.server.rooms[roomID] = &Room{Clients: map[*Client]bool{c: true}, roomID: roomID}
	}
	c.server.mu.Unlock()
}
