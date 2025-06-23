package functional

func MapForEach[K comparable, V any](Map map[K]V, Callback func(key K, value V)) {
	for key, value := range Map {
		Callback(key, value)
	}
}
func MapReduce[K comparable, V any, I any](Map map[K]V, Callback func(pre I, curKey K, curValue V) I, init I) I {
	for key, value := range Map {
		init = Callback(init, key, value)
	}
	return init
}
func SliceForEach[E any](Slice []E, Callback func(value E, index int)) {
	for index, value := range Slice {
		Callback(value, index)
	}
}
func SliceReduce[E any, I any](Slice []E, Callback func(pre I, curValue E, curIndex int) I, init I) I {
	for index, value := range Slice {
		init = Callback(init, value, index)
	}
	return init
}
