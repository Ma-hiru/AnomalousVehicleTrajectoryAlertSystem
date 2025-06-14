import request, { NewResponseData } from "@/utils/request";
import { YamlToJson } from "@/utils/handleYaml";
import Logger from "@/utils/logger";
import AppSettings from "@/settings";

export const reqGetGo2rtcConfig = async (): Promise<ReqResponse<Go2rtcConfigYaml | null>> => {
  const ResponseData = NewResponseData<Go2rtcConfigYaml>();
  try {
    const res: string = await request.get(AppSettings.API.Go2rtcConfig);
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

/**
 * @description  修改配置文件
 * @Notice 需要重启生效
 * */
export const reqPatchGo2rtcConfig = async (data: string): Promise<ReqResponse<null>> => {
  try {
    await request.patch(AppSettings.API.Go2rtcConfig, data);
    return NewResponseData(null, 200, true);
  } catch (err) {
    Logger.Echo({ err });
    throw new Error("请求失败，请检查网络连接");
  }
};
export const reqGetAllStreamsInfo = async (): Promise<ReqResponse<StreamInfoResponse>> => {
  try {
    const ResponseData = NewResponseData<StreamInfoResponse>(
      await request.get(AppSettings.API.Go2rtcStreams)
    );
    if (ResponseData.data === null) {
      ResponseData.code = 201;
      ResponseData.ok = false;
      ResponseData.message = "获取流信息失败";
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
export const reqGetStreamList = async (): Promise<ReqResponse<StreamSimpleList>> => {
  try {
    const info = await reqGetAllStreamsInfo();
    if (info.ok) {
      const list: StreamSimpleList = [];
      for (const name in info.data) {
        list.push({
          name,
          url: info.data[name].producers.map((item: Producers) => item.url)
        });
      }
      return NewResponseData(list, info.code, info.ok, info.message);
    } else {
      return NewResponseData([] as StreamSimpleList, info.code, info.ok, info.message);
    }
  } catch (getStreamListErr) {
    Logger.Echo({ getStreamListErr });
    throw new Error("请求失败，请检查网络连接");
  }
};
export const reqRestart = async (): Promise<ReqResponse<null>> => {
  try {
    await request.post(AppSettings.API.GinRestart);
    return NewResponseData(null, 200, true);
  } catch (err) {
    Logger.Echo({ err });
    throw new Error("请求失败，请检查网络连接");
  }
};
/** @description 增加或修改流 */
export const reqCreateNewStream = async (name: string, url: string[]) => {
  const query =
    `?name=${name}` +
    url.reduce((pre, cur) => {
      return pre + "&src=" + cur;
    }, "");
  try {
    await request.put(AppSettings.API.Go2rtcStreams + query);
    return NewResponseData(null, 200, true);
  } catch (err) {
    Logger.Echo({ err });
    throw new Error("请求失败，请检查网络连接");
  }
};
export const reqDeleteStream = async (name: string) => {
  try {
    await request.delete(AppSettings.API.Go2rtcStreams + `?src=${name}`);
    return NewResponseData(null, 200, true);
  } catch (err) {
    Logger.Echo({ err });
    throw new Error("请求失败，请检查网络连接");
  }
};
