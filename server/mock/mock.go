package mock

import (
	"context"
	"fmt"
	"path/filepath"
	"server/apiServer/model"
	"server/apiServer/service"
	"server/core/enum"
	"server/core/functional"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"shiina-mahiru.cn/preload"
)

func Records(streamName string, ctx context.Context, confidence float64) {
	recordsWithLicensePlateType(streamName, ctx, confidence, true)
}

// recordsWithLicensePlateType 内部函数，支持选择车牌类型
func recordsWithLicensePlateType(streamName string, ctx context.Context, confidence float64, useNingbo bool) {
	baseTime := time.Now()
	streamId := enum.
		NewResultFrom(
			service.Stream.
				WithContext(context.Background()).
				Where(service.Stream.StreamName.Eq(streamName)).
				First,
		).
		Expect("获取视频流不存在").
		StreamID

	//clearRecords(streamId).
	//	OnOk(func(value int) {
	//		if value > 0 {
	//			fmt.Printf("清除旧记录成功, 影响行数: %d\n", value)
	//		} else {
	//			fmt.Println("没有旧记录需要清除")
	//		}
	//	}).
	//	Expect("清除旧记录失败")

	enum.
		NewResultFromWithValue(
			preload.NewDetectionProcessor,
			filepath.Join("./video/detection_data.json"),
		).
		OnOk(func(temp *preload.DetectionProcessor) {
			functional.SetInterval(
				func(cancel context.CancelFunc) {
					defer func() {
						if err := recover(); err != nil {
							fmt.Println(err)
							cancel()
						}
					}()
					select {
					case <-ctx.Done():
						cancel()
						return
					default:
						insertRecordsWithLicensePlateType(temp, streamId, baseTime, cancel, confidence, useNingbo)
					}
				},
				time.Second,
			)
		})
}

func insertRecordsWithLicensePlateType(
	temp *preload.DetectionProcessor,
	streamId int32,
	baseTime time.Time,
	cancel context.CancelFunc,
	confidence float64,
	useNingbo bool,
) {
	var records = enum.
		NewResultFromWithValue(
			temp.GetBehaviorDataByTime,
			time.Since(baseTime).Seconds(),
		).
		OnErrPure(cancel).
		Expect("获取模拟行为数据失败")

	var shouldInsertCars = make([]*model.Car, 0)
	var shouldInsertRecords = make([]*model.Record, 0)

	// 获取车牌管理器
	plateManager := GetLicensePlateManager()

	for _, Detection := range records.Detections {
		if Detection.Confidence < confidence {
			continue
		}

		// 根据选择生成车牌号
		var licensePlate string
		if useNingbo {
			licensePlate = plateManager.GetOrCreateNingboLicensePlate(Detection.CarID)
		} else {
			licensePlate = plateManager.GetOrCreateLicensePlate(Detection.CarID)
		}

		shouldInsertCars = append(shouldInsertCars, &model.Car{
			CarID: licensePlate, // 直接使用车牌号作为CarID
		})
		shouldInsertRecords = append(shouldInsertRecords, &model.Record{
			CarID:    licensePlate, // 使用车牌号作为CarID
			StreamID: streamId,
			ActionID: int64(Detection.Behavior.ActionID),
			Time:     time.Now().UnixMilli(),
		})
	}
	_ = service.Car.
		WithContext(context.Background()).
		Clauses(clause.OnConflict{DoNothing: true}).
		Create(shouldInsertCars...)
	enum.
		ErrToResult(service.Record.
			WithContext(context.Background()).
			Create(shouldInsertRecords...),
		).
		OnErrPure(cancel).
		Expect("插入行为记录失败")
}

func clearRecords(streamId int32) *enum.Result[int] {
	var rowsAffected = 0

	result, err := service.Car.
		WithContext(context.Background()).
		Session(&gorm.Session{AllowGlobalUpdate: true}).
		Delete()
	if err != nil {
		return enum.Err[int](err)
	}
	rowsAffected += int(result.RowsAffected)

	result, err = service.Record.
		WithContext(context.Background()).
		Where(service.Record.StreamID.Eq(streamId)).
		Session(&gorm.Session{AllowGlobalUpdate: true}).
		Delete()
	if err != nil {
		return enum.Err[int](err)
	}
	rowsAffected += int(result.RowsAffected)

	return enum.Ok(rowsAffected)
}

func ClearAll() *enum.Result[int] {
	var rowsAffected = 0

	result, err := service.Car.
		WithContext(context.Background()).
		Session(&gorm.Session{AllowGlobalUpdate: true}).
		Delete()
	if err != nil {
		return enum.Err[int](err)
	}
	rowsAffected += int(result.RowsAffected)

	result, err = service.Record.
		WithContext(context.Background()).
		Session(&gorm.Session{AllowGlobalUpdate: true}).
		Delete()
	if err != nil {
		return enum.Err[int](err)
	}
	rowsAffected += int(result.RowsAffected)

	return enum.Ok(rowsAffected)
}
