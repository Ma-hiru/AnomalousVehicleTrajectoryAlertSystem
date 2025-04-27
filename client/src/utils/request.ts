import axios from "axios";
import { baseUrl, tokenPrefix } from "@/settings";

const request = axios.create({
  timeout: 5000
});
request.interceptors.request.use(config => {
  config.headers.Authorization = tokenPrefix + localStorage.getItem("token");
  if (config.url)
    if (!(config.url.startsWith("http")))
      config.url = baseUrl + config.url;
  return config;
});
//TODO 权限认证、服务器错误处理
request.interceptors.response.use(res => {
  if (res.headers.Authorization)
    localStorage.setItem("token", res.headers.Authorization);
  return res.data;
}, err => {
  console.log(`请求出错！code:${err?.response.status}`);
});

export default request;

interface NewResponseData {
  <T>(): ReqResponse<T | null>;

  <T>(data?: T, code?: number, ok?: boolean, message?: string): ReqResponse<T>;
}

export const NewResponseData = (<T>(data?: T, code?: number, ok?: boolean, message?: string): ReqResponse<T | null> => {
  return {
    code: code || 0,
    ok: ok || false,
    message: message || "",
    data: data || null
  };
}) as NewResponseData;

