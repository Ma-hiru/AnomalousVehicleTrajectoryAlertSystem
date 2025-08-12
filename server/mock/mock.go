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

func RecordsMock(streamName string, ctx context.Context, dataPath string) {
	var provinces = []string{"浙"}
	var regions = []string{"B", "U"}
	var rate float32 = 0.6
	records(
		streamName,
		ctx,
		0.5,
		provinces,
		regions,
		rate,
		dataPath,
	)
}

func records(
	streamName string,
	ctx context.Context,
	confidence float64,
	provinces []string,
	letters []string,
	rate float32,
	dataPath string,
) {
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
			filepath.Join(dataPath),
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
						insertRecordsWithLicensePlateType(
							temp,
							streamId,
							baseTime,
							cancel,
							confidence,
							provinces,
							letters,
							rate,
						)
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
	provinces []string,
	letters []string,
	rate float32,
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
	var licensePlate string

	for _, Detection := range records.Detections {
		if Detection.Confidence < confidence {
			continue
		}
		licensePlate = plateManager.GetOrCreateLicensePlate(Detection.CarID, provinces, letters, rate)
		shouldInsertCars = append(shouldInsertCars, &model.Car{
			CarID: licensePlate,
		})
		shouldInsertRecords = append(shouldInsertRecords, &model.Record{
			CarID:    licensePlate,
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
