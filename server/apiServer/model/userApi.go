package model

type LoginParams struct {
	Username string `json:"username" binding:"required" form:"username"`
	Password string `json:"password" binding:"required" form:"password"`
}
type LoginResponseData struct {
	Username string `json:"username"`
	Avatar   string `json:"avatar"`
	Token    string `json:"token"`
}
