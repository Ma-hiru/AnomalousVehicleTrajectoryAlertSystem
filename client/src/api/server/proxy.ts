import AppSettings from "@/settings";
import request from "@/utils/request";

const V1 = AppSettings.GinAPI.V1;

/**
 * @desc `修改go2rtc配置文件内容`
 * @return object
 * @param content yaml内容
 * */
export const req_update_go2rtc_yaml = (content: string): Promise<ReqResponse<object>> => {
  return request.post(V1.go2rtc_yaml, { content });
};
