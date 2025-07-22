package start

import (
	"dario.cat/mergo"
	"fmt"
	"testing"
)

func TestConfigEngine_ApplySettings(t *testing.T) {
	type test struct {
		A *int
		B *int
	}
	A := 1
	B := 2
	C := 3
	defaultTest := test{
		A: &A,
		B: &B,
	}
	newTest := test{
		A: &C,
		B: nil,
	}
	_ = mergo.Merge(&defaultTest, newTest, mergo.WithOverride)
	fmt.Printf("%v %v", *defaultTest.A, *defaultTest.B)
}
