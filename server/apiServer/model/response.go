package model

type Response struct {
	Code    int    `json:"code"`
	Ok      bool   `json:"ok"`
	Message string `json:"message"`
	Data    any    `json:"data"`
}
