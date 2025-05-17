import request from "@/utils/request.ts";
import AppSettings from "@/settings";


export const reqLogin = (loginParams: LoginParams): Promise<ReqResponse<LoginResponseData>> => request.post(AppSettings.API.LoginUrl, loginParams);
