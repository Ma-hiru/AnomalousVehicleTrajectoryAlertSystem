import Logger from "@/utils/logger";
import { API } from "@/api";
import { NewResponseData, ResponseDataFrom } from "@/utils/request";

export const fetchData = async <T extends ReqResponse<any>, P extends any[]>(
  reqFn: (...args: P) => Promise<T>,
  reqData: P,
  success?: (res: T) => void,
  fail?: (res: T) => void
) => {
  try {
    const res = await reqFn(...reqData);
    if (res?.ok) {
      success && success(res);
    } else {
      fail && fail(res);
    }
    return res?.code || 201;
  } catch (err) {
    Logger.Echo({ err });
    Logger.Message.Error("请求失败，请检查网络连接！");
  }
};

type API = typeof API;

type PromiseData<T> = T extends Promise<infer U> ? U : T;

export const fetchDataAsync = async <K extends keyof API, R = PromiseData<ReturnType<API[K]>>>(
  reqFn: K,
  reqData: Parameters<API[K]>
): Promise<R> => {
  try {
    const func: Function = API[reqFn];
    const data = await Promise.resolve(func(...reqData));
    return ResponseDataFrom(data) as R;
  } catch (fetchDataErr) {
    Logger.Echo({ fetchDataErr });
    Logger.Message.Error("请求失败，请检查网络连接！");
    return NewResponseData(null, 201, false, "请求失败") as R;
  }
};
