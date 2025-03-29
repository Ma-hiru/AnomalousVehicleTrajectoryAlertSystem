package app

import "server/settings"

var defaultPemFilePath = settings.DefaultPemFilePath

type pemFilePath = settings.PemFilePath

var errMsg = settings.ErrMsg

var corsConfig = settings.CorsConfig(*corsFlag)
