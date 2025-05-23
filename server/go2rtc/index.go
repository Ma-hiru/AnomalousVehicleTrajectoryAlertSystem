package go2rtc

import (
	"fmt"
	"server/control"
	"server/go2rtc/internal/api"
	"server/go2rtc/internal/api/ws"
	"server/go2rtc/internal/app"
	"server/go2rtc/internal/bubble"
	"server/go2rtc/internal/debug"
	"server/go2rtc/internal/doorbird"
	"server/go2rtc/internal/dvrip"
	"server/go2rtc/internal/echo"
	"server/go2rtc/internal/exec"
	"server/go2rtc/internal/expr"
	"server/go2rtc/internal/ffmpeg"
	"server/go2rtc/internal/gopro"
	"server/go2rtc/internal/hass"
	"server/go2rtc/internal/hls"
	"server/go2rtc/internal/homekit"
	"server/go2rtc/internal/http"
	"server/go2rtc/internal/isapi"
	"server/go2rtc/internal/ivideon"
	"server/go2rtc/internal/mjpeg"
	"server/go2rtc/internal/mp4"
	"server/go2rtc/internal/mpegts"
	"server/go2rtc/internal/nest"
	"server/go2rtc/internal/ngrok"
	"server/go2rtc/internal/onvif"
	"server/go2rtc/internal/ring"
	"server/go2rtc/internal/roborock"
	"server/go2rtc/internal/rtmp"
	"server/go2rtc/internal/rtsp"
	"server/go2rtc/internal/srtp"
	"server/go2rtc/internal/streams"
	"server/go2rtc/internal/tapo"
	"server/go2rtc/internal/v4l2"
	"server/go2rtc/internal/webrtc"
	"server/go2rtc/internal/webtorrent"
)

func Run(ctl *control.Control, self *control.Routine) {
	defer func() {
		if r := recover(); r != nil {
			ctl.Sign <- control.Sign{
				Err:  fmt.Errorf("panic: %v", r),
				To:   ctl,
				Form: self,
				Ev:   control.ErrEv,
			}
		}
	}()
	app.Version = "1.9.9"
	// 1. Core serviceModule: app, api/ws, streams
	app.Init()     // init config and logs
	api.Init()     // init API before all others
	ws.Init()      // init WS API endpoint
	streams.Init() // streams module
	// 2. Main sources and servers
	rtsp.Init()   // rtsp source, RTSP server
	webrtc.Init() // webrtc source, WebRTC server
	// 3. Main API
	mp4.Init()   // MP4 API
	hls.Init()   // HLS API
	mjpeg.Init() // MJPEG API
	// 4. Other sources and servers
	hass.Init()       // hass source, Hass API server
	onvif.Init()      // onvif source, ONVIF API server
	webtorrent.Init() // webtorrent source, WebTorrent module
	// 5. Other sources
	rtmp.Init()     // rtmp source
	exec.Init()     // exec source
	ffmpeg.Init()   // ffmpeg source
	echo.Init()     // echo source
	ivideon.Init()  // ivideon source
	http.Init()     // http/tcp source
	dvrip.Init()    // dvrip source
	tapo.Init()     // tapo source
	isapi.Init()    // isapi source
	mpegts.Init()   // mpegts passive source
	roborock.Init() // roborock source
	homekit.Init()  // homekit source
	ring.Init()     // ring source
	nest.Init()     // nest source
	bubble.Init()   // bubble source
	expr.Init()     // expr source
	gopro.Init()    // gopro source
	doorbird.Init() // doorbird source
	v4l2.Init()     // v4l2 source
	// 6. Helper serviceModule
	ngrok.Init() // ngrok module
	srtp.Init()  // SRTP server
	debug.Init() // debug API
	// 7. Go
	for {
		select {
		case sign, ok := <-self.Sign:
			if !ok {
				return
			}
			if sign.To.GetName() == self.Name {
				if sign.Ev == control.StopEv {
					return
				}
			}
		}
	}
	//shell.RunUntilSignal(exit)
}
