package service

import (
	"log"
	"server/apiServer/model"
)

func GetUser(u model.User) (*model.User, bool) {
	if res := Db.Where(&u).First(&u); res.Error != nil {
		log.Println(res.Error)
		return nil, false
	}
	return &u, true
}
func GetAllUser(page, size int) (users []model.User, ok bool) {
	offset := (page - 1) * size
	if res := Db.Offset(offset).Limit(size).Find(&users); res.Error != nil {
		log.Println(res.Error)
		return nil, false
	}
	return users, true
}
func UpdateUser(old model.User, new model.User) (*model.User, bool) {
	if old.Id == 0 {
		log.Println("Id is null.")
		return nil, false
	} else {
		if res := Db.Model(model.User{Id: old.Id}).Updates(&new); res.Error != nil {
			return nil, false
		}
		return &new, true
	}
}
func CreateUser(u model.User) (*model.User, bool) {
	if res := Db.Create(&u); res.Error != nil {
		log.Println(res.Error)
		return nil, false
	}
	return &u, true
}
func DeleteUser(u model.User) (*model.User, bool) {
	if u.Id == 0 {
		log.Println("Id is null.")
		return nil, false
	} else {
		if res := Db.Delete(&model.User{Id: u.Id}); res.Error != nil {
			return nil, false
		}
		return &u, true
	}
}
