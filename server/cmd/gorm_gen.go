package main

import (
	"fmt"
	"gorm.io/driver/mysql"
	"gorm.io/gen"
	"gorm.io/gorm"
)

const DefaultMySqlDSN = "root:0514+@tcp(127.0.0.1:3306)/avtas?charset=utf8mb4&parseTime=True&loc=Local"

func connect(dsn string) *gorm.DB {
	db, err := gorm.Open(mysql.Open(dsn))
	if err != nil {
		panic(fmt.Errorf("connect db fail: %w", err))
	}
	return db
}

func main() {
	g := gen.NewGenerator(
		gen.Config{
			// 默认会在 OutPath 目录生成CRUD代码，并且同目录下生成 model 包
			// 所以OutPath最终package不能设置为model，在有数据库表同步的情况下会产生冲突
			// 若一定要使用可以通过ModelPkgPath单独指定model package的名称
			OutPath: "../apiServer/service",
			// gen.WithoutContext：禁用WithContext模式
			// gen.WithDefaultQuery：生成一个全局Query对象Q
			// gen.WithQueryInterface：生成Query接口
			Mode: gen.WithDefaultQuery | gen.WithQueryInterface,
		},
	)
	// 通常复用项目中已有的SQL连接配置db(*gorm.DB)
	// 非必需，但如果需要复用连接时的gorm.Config或需要连接数据库同步表信息则必须设置
	g.UseDB(connect(DefaultMySqlDSN))
	// 从连接的数据库为所有表生成Model结构体和CRUD代码
	// 也可以手动指定需要生成代码的数据表
	g.ApplyBasic(g.GenerateAllTable()...)

	// 执行并生成代码
	g.Execute()
}
