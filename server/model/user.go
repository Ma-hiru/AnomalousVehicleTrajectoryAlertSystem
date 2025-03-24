package model

import "database/sql"

type User struct {
	Id         int            `gorm:"type:int;primaryKey;autoIncrement;column:id" json:"id"`
	Username   string         `gorm:"type:nchar(10);username;not null;unique" json:"username"`
	Password   string         `gorm:"type:char(10);password;not null" json:"password"`
	Avatar     string         `gorm:"type:varchar(50);column:avatar;not null;default:''" json:"avatar"`
	Status     sql.Null[int8] `gorm:"type:int8;column:status;not null;default:0" json:"status"`
	CreateTime string         `gorm:"type:char(20);column:createTime;not null" json:"createTime"`
	UpdateTime string         `gorm:"type:char(20);column:updateTime;not null" json:"updateTime"`
}

func (u User) TableName() string {
	return "user"
}
