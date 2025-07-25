// Code generated by gorm.io/gen. DO NOT EDIT.
// Code generated by gorm.io/gen. DO NOT EDIT.
// Code generated by gorm.io/gen. DO NOT EDIT.

package service

import (
	"context"
	"database/sql"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"gorm.io/gorm/schema"

	"gorm.io/gen"
	"gorm.io/gen/field"

	"gorm.io/plugin/dbresolver"

	"server/apiServer/model"
)

func newCar(db *gorm.DB, opts ...gen.DOOption) car {
	_car := car{}

	_car.carDo.UseDB(db, opts...)
	_car.carDo.UseModel(&model.Car{})

	tableName := _car.carDo.TableName()
	_car.ALL = field.NewAsterisk(tableName)
	_car.CarID = field.NewString(tableName, "carId")

	_car.fillFieldMap()

	return _car
}

type car struct {
	carDo carDo

	ALL   field.Asterisk
	CarID field.String

	fieldMap map[string]field.Expr
}

func (c car) Table(newTableName string) *car {
	c.carDo.UseTable(newTableName)
	return c.updateTableName(newTableName)
}

func (c car) As(alias string) *car {
	c.carDo.DO = *(c.carDo.As(alias).(*gen.DO))
	return c.updateTableName(alias)
}

func (c *car) updateTableName(table string) *car {
	c.ALL = field.NewAsterisk(table)
	c.CarID = field.NewString(table, "carId")

	c.fillFieldMap()

	return c
}

func (c *car) WithContext(ctx context.Context) ICarDo { return c.carDo.WithContext(ctx) }

func (c car) TableName() string { return c.carDo.TableName() }

func (c car) Alias() string { return c.carDo.Alias() }

func (c car) Columns(cols ...field.Expr) gen.Columns { return c.carDo.Columns(cols...) }

func (c *car) GetFieldByName(fieldName string) (field.OrderExpr, bool) {
	_f, ok := c.fieldMap[fieldName]
	if !ok || _f == nil {
		return nil, false
	}
	_oe, ok := _f.(field.OrderExpr)
	return _oe, ok
}

func (c *car) fillFieldMap() {
	c.fieldMap = make(map[string]field.Expr, 1)
	c.fieldMap["carId"] = c.CarID
}

func (c car) clone(db *gorm.DB) car {
	c.carDo.ReplaceConnPool(db.Statement.ConnPool)
	return c
}

func (c car) replaceDB(db *gorm.DB) car {
	c.carDo.ReplaceDB(db)
	return c
}

type carDo struct{ gen.DO }

type ICarDo interface {
	gen.SubQuery
	Debug() ICarDo
	WithContext(ctx context.Context) ICarDo
	WithResult(fc func(tx gen.Dao)) gen.ResultInfo
	ReplaceDB(db *gorm.DB)
	ReadDB() ICarDo
	WriteDB() ICarDo
	As(alias string) gen.Dao
	Session(config *gorm.Session) ICarDo
	Columns(cols ...field.Expr) gen.Columns
	Clauses(conds ...clause.Expression) ICarDo
	Not(conds ...gen.Condition) ICarDo
	Or(conds ...gen.Condition) ICarDo
	Select(conds ...field.Expr) ICarDo
	Where(conds ...gen.Condition) ICarDo
	Order(conds ...field.Expr) ICarDo
	Distinct(cols ...field.Expr) ICarDo
	Omit(cols ...field.Expr) ICarDo
	Join(table schema.Tabler, on ...field.Expr) ICarDo
	LeftJoin(table schema.Tabler, on ...field.Expr) ICarDo
	RightJoin(table schema.Tabler, on ...field.Expr) ICarDo
	Group(cols ...field.Expr) ICarDo
	Having(conds ...gen.Condition) ICarDo
	Limit(limit int) ICarDo
	Offset(offset int) ICarDo
	Count() (count int64, err error)
	Scopes(funcs ...func(gen.Dao) gen.Dao) ICarDo
	Unscoped() ICarDo
	Create(values ...*model.Car) error
	CreateInBatches(values []*model.Car, batchSize int) error
	Save(values ...*model.Car) error
	First() (*model.Car, error)
	Take() (*model.Car, error)
	Last() (*model.Car, error)
	Find() ([]*model.Car, error)
	FindInBatch(batchSize int, fc func(tx gen.Dao, batch int) error) (results []*model.Car, err error)
	FindInBatches(result *[]*model.Car, batchSize int, fc func(tx gen.Dao, batch int) error) error
	Pluck(column field.Expr, dest interface{}) error
	Delete(...*model.Car) (info gen.ResultInfo, err error)
	Update(column field.Expr, value interface{}) (info gen.ResultInfo, err error)
	UpdateSimple(columns ...field.AssignExpr) (info gen.ResultInfo, err error)
	Updates(value interface{}) (info gen.ResultInfo, err error)
	UpdateColumn(column field.Expr, value interface{}) (info gen.ResultInfo, err error)
	UpdateColumnSimple(columns ...field.AssignExpr) (info gen.ResultInfo, err error)
	UpdateColumns(value interface{}) (info gen.ResultInfo, err error)
	UpdateFrom(q gen.SubQuery) gen.Dao
	Attrs(attrs ...field.AssignExpr) ICarDo
	Assign(attrs ...field.AssignExpr) ICarDo
	Joins(fields ...field.RelationField) ICarDo
	Preload(fields ...field.RelationField) ICarDo
	FirstOrInit() (*model.Car, error)
	FirstOrCreate() (*model.Car, error)
	FindByPage(offset int, limit int) (result []*model.Car, count int64, err error)
	ScanByPage(result interface{}, offset int, limit int) (count int64, err error)
	Rows() (*sql.Rows, error)
	Row() *sql.Row
	Scan(result interface{}) (err error)
	Returning(value interface{}, columns ...string) ICarDo
	UnderlyingDB() *gorm.DB
	schema.Tabler
}

func (c carDo) Debug() ICarDo {
	return c.withDO(c.DO.Debug())
}

func (c carDo) WithContext(ctx context.Context) ICarDo {
	return c.withDO(c.DO.WithContext(ctx))
}

func (c carDo) ReadDB() ICarDo {
	return c.Clauses(dbresolver.Read)
}

func (c carDo) WriteDB() ICarDo {
	return c.Clauses(dbresolver.Write)
}

func (c carDo) Session(config *gorm.Session) ICarDo {
	return c.withDO(c.DO.Session(config))
}

func (c carDo) Clauses(conds ...clause.Expression) ICarDo {
	return c.withDO(c.DO.Clauses(conds...))
}

func (c carDo) Returning(value interface{}, columns ...string) ICarDo {
	return c.withDO(c.DO.Returning(value, columns...))
}

func (c carDo) Not(conds ...gen.Condition) ICarDo {
	return c.withDO(c.DO.Not(conds...))
}

func (c carDo) Or(conds ...gen.Condition) ICarDo {
	return c.withDO(c.DO.Or(conds...))
}

func (c carDo) Select(conds ...field.Expr) ICarDo {
	return c.withDO(c.DO.Select(conds...))
}

func (c carDo) Where(conds ...gen.Condition) ICarDo {
	return c.withDO(c.DO.Where(conds...))
}

func (c carDo) Order(conds ...field.Expr) ICarDo {
	return c.withDO(c.DO.Order(conds...))
}

func (c carDo) Distinct(cols ...field.Expr) ICarDo {
	return c.withDO(c.DO.Distinct(cols...))
}

func (c carDo) Omit(cols ...field.Expr) ICarDo {
	return c.withDO(c.DO.Omit(cols...))
}

func (c carDo) Join(table schema.Tabler, on ...field.Expr) ICarDo {
	return c.withDO(c.DO.Join(table, on...))
}

func (c carDo) LeftJoin(table schema.Tabler, on ...field.Expr) ICarDo {
	return c.withDO(c.DO.LeftJoin(table, on...))
}

func (c carDo) RightJoin(table schema.Tabler, on ...field.Expr) ICarDo {
	return c.withDO(c.DO.RightJoin(table, on...))
}

func (c carDo) Group(cols ...field.Expr) ICarDo {
	return c.withDO(c.DO.Group(cols...))
}

func (c carDo) Having(conds ...gen.Condition) ICarDo {
	return c.withDO(c.DO.Having(conds...))
}

func (c carDo) Limit(limit int) ICarDo {
	return c.withDO(c.DO.Limit(limit))
}

func (c carDo) Offset(offset int) ICarDo {
	return c.withDO(c.DO.Offset(offset))
}

func (c carDo) Scopes(funcs ...func(gen.Dao) gen.Dao) ICarDo {
	return c.withDO(c.DO.Scopes(funcs...))
}

func (c carDo) Unscoped() ICarDo {
	return c.withDO(c.DO.Unscoped())
}

func (c carDo) Create(values ...*model.Car) error {
	if len(values) == 0 {
		return nil
	}
	return c.DO.Create(values)
}

func (c carDo) CreateInBatches(values []*model.Car, batchSize int) error {
	return c.DO.CreateInBatches(values, batchSize)
}

// Save : !!! underlying implementation is different with GORM
// The method is equivalent to executing the statement: db.Clauses(clause.OnConflict{UpdateAll: true}).Create(values)
func (c carDo) Save(values ...*model.Car) error {
	if len(values) == 0 {
		return nil
	}
	return c.DO.Save(values)
}

func (c carDo) First() (*model.Car, error) {
	if result, err := c.DO.First(); err != nil {
		return nil, err
	} else {
		return result.(*model.Car), nil
	}
}

func (c carDo) Take() (*model.Car, error) {
	if result, err := c.DO.Take(); err != nil {
		return nil, err
	} else {
		return result.(*model.Car), nil
	}
}

func (c carDo) Last() (*model.Car, error) {
	if result, err := c.DO.Last(); err != nil {
		return nil, err
	} else {
		return result.(*model.Car), nil
	}
}

func (c carDo) Find() ([]*model.Car, error) {
	result, err := c.DO.Find()
	return result.([]*model.Car), err
}

func (c carDo) FindInBatch(batchSize int, fc func(tx gen.Dao, batch int) error) (results []*model.Car, err error) {
	buf := make([]*model.Car, 0, batchSize)
	err = c.DO.FindInBatches(&buf, batchSize, func(tx gen.Dao, batch int) error {
		defer func() { results = append(results, buf...) }()
		return fc(tx, batch)
	})
	return results, err
}

func (c carDo) FindInBatches(result *[]*model.Car, batchSize int, fc func(tx gen.Dao, batch int) error) error {
	return c.DO.FindInBatches(result, batchSize, fc)
}

func (c carDo) Attrs(attrs ...field.AssignExpr) ICarDo {
	return c.withDO(c.DO.Attrs(attrs...))
}

func (c carDo) Assign(attrs ...field.AssignExpr) ICarDo {
	return c.withDO(c.DO.Assign(attrs...))
}

func (c carDo) Joins(fields ...field.RelationField) ICarDo {
	for _, _f := range fields {
		c = *c.withDO(c.DO.Joins(_f))
	}
	return &c
}

func (c carDo) Preload(fields ...field.RelationField) ICarDo {
	for _, _f := range fields {
		c = *c.withDO(c.DO.Preload(_f))
	}
	return &c
}

func (c carDo) FirstOrInit() (*model.Car, error) {
	if result, err := c.DO.FirstOrInit(); err != nil {
		return nil, err
	} else {
		return result.(*model.Car), nil
	}
}

func (c carDo) FirstOrCreate() (*model.Car, error) {
	if result, err := c.DO.FirstOrCreate(); err != nil {
		return nil, err
	} else {
		return result.(*model.Car), nil
	}
}

func (c carDo) FindByPage(offset int, limit int) (result []*model.Car, count int64, err error) {
	result, err = c.Offset(offset).Limit(limit).Find()
	if err != nil {
		return
	}

	if size := len(result); 0 < limit && 0 < size && size < limit {
		count = int64(size + offset)
		return
	}

	count, err = c.Offset(-1).Limit(-1).Count()
	return
}

func (c carDo) ScanByPage(result interface{}, offset int, limit int) (count int64, err error) {
	count, err = c.Count()
	if err != nil {
		return
	}

	err = c.Offset(offset).Limit(limit).Scan(result)
	return
}

func (c carDo) Scan(result interface{}) (err error) {
	return c.DO.Scan(result)
}

func (c carDo) Delete(models ...*model.Car) (result gen.ResultInfo, err error) {
	return c.DO.Delete(models)
}

func (c *carDo) withDO(do gen.Dao) *carDo {
	c.DO = *do.(*gen.DO)
	return c
}
