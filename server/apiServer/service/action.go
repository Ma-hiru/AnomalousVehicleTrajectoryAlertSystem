package service

import "server/apiServer/model"

// GetActions 获取行为枚举
func GetActions(condition any) (actions []*model.Actions, ok bool) {
	if condition != nil {
		res := db.Where(condition).Find(&actions)
		return actions, res.Error == nil
	} else {
		res := db.Find(&actions)
		return actions, res.Error == nil
	}
}

// GetActionsLayout 获取行为枚举
func GetActionsLayout(condition any) (actions []*model.ActionsLayout, ok bool) {
	if condition != nil {
		res := db.Where(condition).Find(&actions)
		return actions, res.Error == nil
	} else {
		res := db.Find(&actions)
		return actions, res.Error == nil
	}
}
