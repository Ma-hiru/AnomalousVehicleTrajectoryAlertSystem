package ffmpeg

import (
	"os"
)

// mkdir 创建文件夹
func mkdir(dir string) (err error) {
	var file *os.File
	if file, err = os.Open(dir); err != nil {
		if err = os.MkdirAll(dir, 0755); err != nil {
			return err
		}
	}
	return file.Close()
}

// rmfile 删除多个文件
func rmfile(name []string) error {
	for _, n := range name {
		if err := os.Remove(n); err != nil {
			return err
		}
	}
	return nil
}
