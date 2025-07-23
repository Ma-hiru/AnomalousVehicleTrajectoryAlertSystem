import axios from "axios";
import AppSettings from "@/settings";

const request = axios.create({
  timeout: 5000
});

request.interceptors.request.use((config) => {
  if (config.url && !config.url.startsWith("http")) {
    config.url = AppSettings.baseUrl + config.url;
  }
  return config;
});

request.interceptors.response.use(
  (res) => res.data,
  (axiosError) => {
    throw axiosError;
  }
);

export default request;

interface NewResponseData {
  <T>(): ReqResponse<T | null>;

  <T>(data?: T, code?: number, ok?: boolean, message?: string): ReqResponse<T>;
}

export const NewResponseData = (<T>(
  data?: T,
  code?: number,
  ok?: boolean,
  message?: string
): ReqResponse<T | null> => {
  return {
    code: code || 0,
    ok: ok || false,
    message: message || "",
    data: data || null
  };
}) as NewResponseData;
