package enum

import (
	"errors"
	"fmt"
)

type Result[T any] struct {
	value T
	err   error
}

func (r *Result[T]) Expect(msg string) T {
	if r.IsErr() {
		panic(fmt.Errorf("Err Result:\n msg: %v\n err: %v\n", msg, r.err.Error()))
	}
	return r.value
}

func (r *Result[T]) ExpectOr(f func() string) T {
	if f == nil {
		panic("function is nil")
	}
	return r.Expect(f())
}

func (r *Result[T]) Unwrap() T {
	if r.IsErr() {
		panic(r.err)
	}
	return r.value
}

func (r *Result[T]) UnwrapOr(f func() T) T {
	if r.IsErr() {
		if f == nil {
			panic("function is nil")
		}
		return f()
	}
	return r.value
}

func (r *Result[T]) Default(value T) T {
	if r.IsErr() {
		return value
	}
	return r.value
}

func (r *Result[T]) UnwrapErr() error {
	if r.IsOk() {
		panic("expect error, but got success result")
	}
	return r.err
}

func (r *Result[T]) IsOk() bool {
	if r == nil {
		panic("result is nil")
	}
	return r.err == nil
}

func (r *Result[T]) IsErr() bool {
	return !r.IsOk()
}

func (r *Result[T]) OnErr(f func(err error)) *Result[T] {
	if r.IsErr() && f != nil {
		f(r.err)
	}
	return r
}

func (r *Result[T]) OnErrPure(f func()) *Result[T] {
	if r.IsErr() && f != nil {
		f()
	}
	return r
}

func (r *Result[T]) OnOk(f func(value T)) *Result[T] {
	if r.IsOk() && f != nil {
		f(r.value)
	}
	return r
}

func (r *Result[T]) OnOkPure(f func()) *Result[T] {
	if r.IsOk() && f != nil {
		f()
	}
	return r
}

func (r *Result[T]) Any(f func()) *Result[T] {
	if f != nil {
		f()
	}
	return r
}

func (r *Result[T]) Then(f func(value T) *Result[any]) (res *Result[any]) {
	defer func() {
		if err := recover(); err != nil {
			res = Err[any](fmt.Errorf("result Then panic: %v", err))
		}
	}()
	if f == nil {
		return Err[any](errors.New("function is nil"))
	}
	if r.IsOk() {
		return f(r.value)
	}
	return Err[any](r.err)
}

func (r *Result[T]) ToErrorPure() error {
	if r.IsErr() {
		return r.err
	}
	return nil
}
func (r *Result[T]) ToError(msg string) error {
	if r.IsErr() {
		return fmt.Errorf("Err Result:\n msg: %v\n err: %v\n", msg, r.err.Error())
	}
	return nil
}

func NewResultFrom[T any](f func() (T, error)) *Result[T] {
	if f == nil {
		return Err[T](errors.New("function is nil"))
	}
	data, err := f()
	if err != nil {
		return Err[T](err)
	}
	return Ok[T](data)
}

func NewResultFromWithValue[T any, U any](f func(value U) (T, error), value U) *Result[T] {
	return NewResultFrom(func() (T, error) {
		if f == nil {
			return *new(T), errors.New("function is nil")
		}
		return f(value)
	})
}

type None struct {
}

// Ok 构造成功Result
func Ok[T any](value T) *Result[T] {
	return &Result[T]{value: value}
}

// Err 构造失败Result
func Err[T any](err error) *Result[T] {
	return &Result[T]{err: err}
}

// ErrToResult 将错误转换为Result[None]
// 如果错误不为nil，则返回一个包含错误的Result
// 否则返回一个成功的Result[None]
func ErrToResult(err error) *Result[None] {
	if err != nil {
		return &Result[None]{err: err}
	}
	return &Result[None]{value: None{}}
}
