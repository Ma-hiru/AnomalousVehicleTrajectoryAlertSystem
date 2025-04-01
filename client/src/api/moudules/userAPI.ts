import request from "@/utils/request.ts";
import { API } from "@/settings.ts";


export const reqLogin = (loginParams: LoginParams): Promise<ReqResponse<LoginResponseData>> => request.post(API.LoginUrl, loginParams);
