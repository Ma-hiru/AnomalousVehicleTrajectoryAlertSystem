package my_socketio

type Room struct {
	Clients map[*Client]bool
	roomID  string
}

func (r *Room) Emit(event Event, data string) {
	for client, online := range r.Clients {
		if online {
			client.Emit(string(event), data)
		}
	}
}
