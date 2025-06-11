package debug

import (
	"net/http"
	"net/http/pprof"
	"strings"
)

func PProf(addr string, prefix string) {
	mux := http.NewServeMux()
	if !strings.HasSuffix(prefix, "/") && prefix != "" {
		prefix = "/" + prefix
	}
	mux.HandleFunc(prefix+"/pprof/", pprof.Index)
	mux.HandleFunc(prefix+"/pprof/cmdline", pprof.Cmdline)
	mux.HandleFunc(prefix+"/pprof/profile", pprof.Profile)
	mux.HandleFunc(prefix+"/pprof/symbol", pprof.Symbol)
	mux.HandleFunc(prefix+"/pprof/trace", pprof.Trace)
	_ = http.ListenAndServe(addr, mux)
}
