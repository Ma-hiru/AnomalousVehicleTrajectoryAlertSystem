package model

import "database/sql"

type Cars struct {
	CarId string `gorm:"type:varchar(10);column:carId;primaryKey" json:"carId"`
}
type Streams struct {
	StreamId   sql.Null[int] `gorm:"primaryKey;column:streamId;autoIncrement" json:"streamId,omitempty"`
	StreamName string        `gorm:"type:varchar(20);column:streamName;unique;not null" json:"streamName,omitempty"`
	Addr       string        `gorm:"type:varchar(20);column:addr" json:"addr,omitempty"`
	Latitude   float64       `gorm:"type:double;column:latitude;not null;default:-1" json:"latitude,omitempty"`
	Longitude  float64       `gorm:"type:double;column:longitude;not null;default:-1" json:"longitude,omitempty"`
}
type StreamsLayout struct {
	StreamId   int     `gorm:"primaryKey;column:streamId;autoIncrement" json:"streamId,omitempty"`
	StreamName string  `gorm:"type:varchar(20);column:streamName;unique;not null" json:"streamName,omitempty"`
	Addr       string  `gorm:"type:varchar(20);column:addr" json:"addr,omitempty"`
	Latitude   float64 `gorm:"type:double;column:latitude;not null;default:-1" json:"latitude,omitempty"`
	Longitude  float64 `gorm:"type:double;column:longitude;not null;default:-1" json:"longitude,omitempty"`
}
type Actions struct {
	ActionId   sql.Null[int8] `gorm:"primaryKey;column:actionId;autoIncrement:true" json:"actionId"`
	ActionName string         `gorm:"type:varchar(20);column:actionName;unique;not null" json:"actionName"`
}
type ActionsLayout struct {
	ActionId   int8   `gorm:"primaryKey;column:actionId;autoIncrement:true" json:"actionId"`
	ActionName string `gorm:"type:varchar(20);column:actionName;unique;not null" json:"actionName"`
}
type Records struct {
	RecordId string         `gorm:"type:varchar(15);column:recordId;primaryKey" json:"recordId,omitempty"`
	CarId    string         `gorm:"type:varchar(10);column:carId;not null" json:"carId,omitempty"`
	StreamId sql.Null[int]  `gorm:"column:streamId;not null" json:"streamId,omitempty"`
	ActionId sql.Null[int8] `gorm:"type:int8;column:actionId" json:"actionId,omitempty"`
	Time     int64          `gorm:"type:bigint;column:time;not null" json:"time,omitempty"`
	Cars     Cars           `gorm:"foreignKey:CarId;references:CarId" json:"cars,omitempty"`
	Streams  Streams        `gorm:"foreignKey:StreamId;references:StreamId" json:"streams,omitempty"`
	Actions  Actions        `gorm:"foreignKey:ActionId;references:ActionId" json:"actions,omitempty"`
}
type RecordsLayout struct {
	RecordId string  `gorm:"type:varchar(15);column:recordId;primaryKey" json:"recordId,omitempty"`
	CarId    string  `gorm:"type:varchar(10);column:carId;not null" json:"carId,omitempty"`
	StreamId int     `gorm:"column:streamId;not null" json:"streamId,omitempty"`
	ActionId int8    `gorm:"type:int8;column:actionId" json:"actionId,omitempty"`
	Time     int64   `gorm:"type:bigint;column:time;not null" json:"time,omitempty"`
	Cars     Cars    `gorm:"foreignKey:CarId;references:CarId" json:"cars,omitempty"`
	Streams  Streams `gorm:"foreignKey:StreamId;references:StreamId" json:"streams,omitempty"`
	Actions  Actions `gorm:"foreignKey:ActionId;references:ActionId" json:"actions,omitempty"`
}

func (c Cars) TableName() string {
	return "cars"
}
func (s Streams) TableName() string {
	return "streams"
}
func (s StreamsLayout) TableName() string {
	return "streams"
}
func (a Actions) TableName() string {
	return "actions"
}
func (a ActionsLayout) TableName() string {
	return "actions"
}
func (r Records) TableName() string {
	return "records"
}
func (r RecordsLayout) TableName() string {
	return "records"
}
