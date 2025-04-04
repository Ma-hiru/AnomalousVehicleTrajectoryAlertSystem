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
