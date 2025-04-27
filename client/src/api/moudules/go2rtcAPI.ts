import request, { NewResponseData } from "@/utils/request.ts";
import { API } from "@/settings.ts";
import { YamlToJson } from "@/utils/handleYaml.ts";
import Logger from "@/utils/logger.ts";


export const reqGetGo2rtcConfig = async (): Promise<ReqResponse<Go2rtcConfigYaml | null>> => {
  const ResponseData = NewResponseData<Go2rtcConfigYaml>();
  try {
    const res: string = await request.get(API.Go2rtcConfig);
    ResponseData.data = YamlToJson(res);
    if (ResponseData.data.data === null) {
      ResponseData.code = 201;
      ResponseData.ok = false;
      ResponseData.message = "配置文件解析失败，请检查配置文件";
    } else {
      ResponseData.code = 200;
      ResponseData.ok = true;
    }
    return ResponseData;
  } catch (err) {
    Logger.Echo({ err });
    throw new Error("请求失败，请检查网络连接");
  }
};
export const reqPatchGo2rtcConfig = async (data: string): Promise<ReqResponse<null>> => {
  try {
    await request.patch(API.Go2rtcConfig, data);
    return NewResponseData(null, 200, true);
  } catch (err) {
    Logger.Echo({ err });
    throw new Error("请求失败，请检查网络连接");
  }
};
export const reqGetAllStreamsInfo = (): Promise<Record<string, {
  producers: { url: string }[],
  consumers: unknown[]
}>> => request.get(API.Go2rtcStreams);
export const reqCreateNewStream = () => request.put(API.Go2rtcStreams);
export const reqUpdateStreamSource = () => request.patch(API.Go2rtcStreams);
export const reqDeleteStream = () => request.delete(API.Go2rtcStreams);
