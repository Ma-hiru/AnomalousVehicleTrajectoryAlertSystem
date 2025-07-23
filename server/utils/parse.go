package utils

import "strconv"

func ParseInt(number string, errValue ...int) (int, bool) {
	res, err := strconv.ParseInt(number, 10, 64)
	if err != nil {
		if len(errValue) == 0 {
			return 0, false
		}
		return errValue[0], false
	}
	return int(res), true
}
func ParseInt64(number string, errValue ...int) (int64, bool) {
	res, err := strconv.ParseInt(number, 10, 64)
	if err != nil {
		if len(errValue) == 0 {
			return 0, false
		}
		return int64(errValue[0]), false
	}
	return res, true
}
