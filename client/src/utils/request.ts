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

interface ResponseDataFrom {
  <T extends number | string | boolean>(res: T): ReqResponse<T>;

  <T extends { data: any }>(res: T): ReqResponse<T["data"]>;

  <T extends object>(res: T): ReqResponse<Omit<T, "code" | "ok" | "message">>;
}

export const ResponseDataFrom = (<T>(res: T): ReqResponse<any> => {
  if (typeof res === "boolean" || typeof res === "number" || typeof res === "string") {
    return NewResponseData<T>(res, 200, true, "direct data");
  }

  const response = NewResponseData(res, 201, false, "void data");

  if (res && typeof res === "object") {
    if ("message" in res && typeof res.message === "string") {
      response.message = res.message;
      Reflect.deleteProperty(res, "message");
    } else response.message = "";

    if ("ok" in res && typeof res.ok === "boolean") {
      response.ok = res.ok;
      Reflect.deleteProperty(res, "ok");
    } else response.ok = true;

    if ("code" in res && typeof res.code === "number") {
      response.code = res.code;
      Reflect.deleteProperty(res, "code");
    } else if (response.ok) response.code = 200;
    else response.code = 201;

    if ("data" in res) response.data = res.data as T;
    else response.data = Object.create(res);
  }
  return response;
}) as ResponseDataFrom;

export function buildQuery(baseURL: string, query?: Record<string, string>): string {
  if (baseURL && !baseURL.startsWith("http")) {
    baseURL = AppSettings.baseUrl + baseURL;
  }
  const url = new URL(baseURL);
  if (query) {
    for (const key in query) {
      url.searchParams.append(key, query[key]);
    }
  }
  return url.href;
}

export type Stringify<T> = {
  [key in keyof T]: T[key] extends object ? Stringify<T[key]> : string;
};

export type RequiredField<T, U extends keyof T> = T & Required<Pick<T, U>>;

export type PartialField<T, U extends keyof T> = Omit<T, U> & Partial<Pick<T, U>>;
