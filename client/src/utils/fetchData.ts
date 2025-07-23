import Logger from "@/utils/logger";

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
