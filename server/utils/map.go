package utils

func MapForEach(Map map[any]any, Callback func(key any, value any)) {
	for key, value := range Map {
		Callback(key, value)
	}
}
func MapReduce(Map map[any]any, Callback func(pre any, curKey any, curValue any) any, init any) any {
	for key, value := range Map {
		init = Callback(init, key, value)
	}
	return init
}
func SliceForEach(Slice []any, Callback func(value any, index int)) {
	for index, value := range Slice {
		Callback(value, index)
	}
}
func SliceReduce[T any, U any](Slice []T, Callback func(pre U, curValue T, curIndex int) U, init U) U {
	for index, value := range Slice {
		init = Callback(init, value, index)
	}
	return init
}
func AnySlice(slice any) {

}
