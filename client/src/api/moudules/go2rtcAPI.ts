import request from "@/utils/request.ts";
import { API } from "@/settings.ts";
import matter from "gray-matter";


export const reqGetGo2rtcConfig = async (): Promise<Go2rtcConfigYaml> => {
  const res: string = await request.get(API.GetGo2rtcConfig);
  const { data } = matter(res, { language: "yaml", delimiters: "---" });
  return { data, content: res };
};
export const reqGetAllStreamsInfo = (): Promise<Record<string, {
  producers: { url: string }[],
  consumers: unknown[]
}>> => request.get(API.StreamsInfo);
export const reqCreateNewStream = () => request.put(API.StreamsInfo);
export const reqUpdateStreamSource = () => request.patch(API.StreamsInfo);
export const reqDeleteStream = () => request.delete(API.StreamsInfo);
