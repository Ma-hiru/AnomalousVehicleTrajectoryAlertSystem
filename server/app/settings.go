package app

import "server/settings"

var (
	defaultPemFilePath = settings.DefaultPemFilePath
	errMsg             = settings.ErrMsg
	corsConfig         = settings.CorsConfig(*corsFlag)
)

type pemFilePath = settings.PemFilePath
