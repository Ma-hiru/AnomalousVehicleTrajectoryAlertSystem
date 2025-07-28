import AppSettings from "@/settings";
import request, { buildQuery } from "@/utils/request";

const V1 = AppSettings.GinAPI.V1;

/**
 * @desc `获取异常轨迹统计列表`
 * @param query from & to & offset & limit & keywords?
 * @return TrackList[]
 * */
export const req_track_get = (query: {
  from: string;
  to: string;
  offset: string;
  limit: string;
  keywords?: string;
}): Promise<ReqResponse<TrackList[]>> => {
  return request.get(buildQuery(V1.tracks, query));
};
