import request from "@/utils/request.ts";
import { API } from "@/settings.ts";
import { YamlToJson } from "@/utils/handleYaml.ts";


export const reqGetGo2rtcConfig = async (): Promise<Go2rtcConfigYaml> => {
  const res: string = await request.get(API.Go2rtcConfig);
  return YamlToJson(res);
};
export const reqPatchGo2rtcConfig = async (data: string): Promise<null> => await request.patch(API.Go2rtcConfig, data);
export const reqGetAllStreamsInfo = (): Promise<Record<string, {
  producers: { url: string }[],
  consumers: unknown[]
}>> => request.get(API.Go2rtcStreams);
export const reqCreateNewStream = () => request.put(API.Go2rtcStreams);
export const reqUpdateStreamSource = () => request.patch(API.Go2rtcStreams);
export const reqDeleteStream = () => request.delete(API.Go2rtcStreams);
