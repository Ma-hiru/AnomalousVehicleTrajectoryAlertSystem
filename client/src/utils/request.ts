import axios from "axios";
import { baseUrl, tokenPrefix } from "@/settings";

export const request = axios.create({
  timeout: 5000
});
request.interceptors.request.use(config => {
  config.headers.Authorization = tokenPrefix + localStorage.getItem("token");
  if (config.url)
    if (!(config.url.startsWith("http")))
      config.url = baseUrl + config.url;
  return config;
});
request.interceptors.response.use(res => {
  if (res.headers.Authorization)
    localStorage.setItem("token", res.headers.Authorization);
  return res.data;
}, err => {
  console.log(`请求出错！code:${err?.response.status}`);
});


