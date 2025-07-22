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

// CreateAction 创建行为枚举
func CreateAction(actions []model.ActionsLayout) ([]model.ActionsLayout, error) {
	// 使用 FirstOrCreate 避免重复
	var result []model.ActionsLayout
	for _, action := range actions {
		var existingAction model.ActionsLayout
		err := db.Where("actionName = ?", action.ActionName).FirstOrCreate(&existingAction, &action).Error
		if err != nil {
			return nil, err
		}
		result = append(result, existingAction)
	}
	return result, nil
}
