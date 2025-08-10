package utils

import (
	"errors"
	"os/exec"
	"runtime"
	"server/core/enum"
	"strings"
)

type GPU string

const (
	Intel  GPU = "Intel"
	Nvidia GPU = "NVIDIA"
	AMD    GPU = "AMD"
)

func DeviceMeta() *enum.Result[string] {
	switch runtime.GOOS {
	case "windows":
		cmd := exec.Command("wmic", "path", "win32_VideoController", "get", "name")
		output, err := cmd.Output()
		if err != nil {
			return enum.Err[string](err)
		}
		return enum.Ok(string(output))
	case "linux":
		cmd := exec.Command("lspci", "-nnk")
		output, err := cmd.Output()
		if err != nil {
			return enum.Err[string](err)
		}
		return enum.Ok(string(output))
	}
	return enum.Err[string](errors.New("unsupported os " + runtime.GOOS))
}

func DeviceKeyword(keyword string) *enum.Result[bool] {
	var output = DeviceMeta()
	if output.IsOk() {
		return enum.Ok(
			strings.Contains(output.Unwrap(), keyword),
		)
	}
	return enum.Err[bool](output.UnwrapErr())
}

func IsDevice(brand GPU) *enum.Result[bool] {
	return DeviceKeyword(string(brand))
}
