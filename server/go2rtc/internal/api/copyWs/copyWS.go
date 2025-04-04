package copyWs

import (
	"encoding/json"
	"github.com/gorilla/websocket"
	"github.com/rs/zerolog/log"
	"net/http"
	"server/go2rtc/internal/api"
	"sync"
	"time"
)

func Init() {
	api.HandleFunc("/api/ws", apiWS)
}
func apiWS(w http.ResponseWriter, r *http.Request) {
	wsConn, err := wsUp.Upgrade(w, r, nil)
	if err != nil {
		origin := r.Header.Get("Origin")
		log.Error().Err(err).Caller().Msgf("host=%s origin=%s", r.Host, origin)
		return
	}
	transport := &Transport{Request: r}
	transport.OnWrite(func(msg any) error {
		_ = wsConn.SetWriteDeadline(time.Now().Add(time.Second * 5))
		if data, ok := msg.([]byte); ok {
			return wsConn.WriteMessage(websocket.BinaryMessage, data)
		} else {
			return wsConn.WriteJSON(msg)
		}
	})
	for {
		msg := new(Message)
		if err = wsConn.ReadJSON(msg); err != nil {
			if !websocket.IsCloseError(err, websocket.CloseNoStatusReceived) {
				log.Trace().Err(err).Caller().Send()
			}
			_ = wsConn.Close()
			break
		}
		log.Trace().Str("type", msg.Type).Msg("[api] ws msg")
		if handler := wsHandlers[msg.Type]; handler != nil {
			go func() {
				if err = handler(transport, msg); err != nil {
					transport.Write(&Message{
						Type:  "error",
						Value: msg.Type + ":" + err.Error(),
					})
				}
			}()
		}
	}
	transport.Close()
}

var wsUp *websocket.Upgrader

type Transport struct {
	Request *http.Request

	ctx map[any]any

	closed bool
	mx     sync.Mutex
	wrmx   sync.Mutex

	onChange func()
	onWrite  func(msg any) error
	onClose  []func()
}

func (t *Transport) OnWrite(f func(msg any) error) {
	t.mx.Lock()
	if t.onChange != nil {
		t.onChange()
	}
	t.onWrite = f
	t.mx.Unlock()
}

func (t *Transport) Write(msg any) {
	t.wrmx.Lock()
	_ = t.onWrite(msg)
	t.wrmx.Unlock()
}

func (t *Transport) OnClose(f func()) {
	t.mx.Lock()
	if t.closed {
		f()
	} else {
		t.onClose = append(t.onClose, f)
	}
	t.mx.Unlock()
}

func (t *Transport) Close() {
	t.mx.Lock()
	for _, f := range t.onClose {
		f()
	}
	t.closed = true
	t.mx.Unlock()
}

func (t *Transport) OnChange(f func()) {
	t.mx.Lock()
	t.onChange = f
	t.mx.Unlock()
}

// Message - struct for data exchange in Web API
type Message struct {
	Type  string `json:"type"`
	Value any    `json:"value,omitempty"`
}

func (m *Message) String() (value string) {
	if s, ok := m.Value.(string); ok {
		return s
	}
	return ""
}
func (m *Message) Unmarshal(v any) error {
	b, err := json.Marshal(m.Value)
	if err != nil {
		return err
	}
	return json.Unmarshal(b, v)
}

type WSHandler func(tr *Transport, msg *Message) error

var wsHandlers = make(map[string]WSHandler)

func HandleFunc(msgType string, handler WSHandler) {
	wsHandlers[msgType] = handler
}
