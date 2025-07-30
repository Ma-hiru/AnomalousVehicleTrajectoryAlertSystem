import AppSettings from "@/settings";
import request, { buildQuery, Stringify, RequiredField, PartialField } from "@/utils/request";

const V1 = AppSettings.GinAPI.V1;

/**
 * @desc `获取视频列表`
 * @param query streamId or streamName(like) | null(all)
 * @return videos[]
 * */
export const req_videos_get = (
  query?: Stringify<Omit<videos, "longitude" | "latitude" | "addr">>
): Promise<ReqResponse<videos[]>> => {
  return request.get(buildQuery(V1.video_stream, query));
};

/**
 * @desc `更新视频列表`
 * @param param streamId streamName? addr? latitude? longitude?
 * @return QueryInfo
 * */
export const req_videos_patch = (
  param: RequiredField<Partial<Stringify<videos>>, "streamId">
): Promise<ReqResponse<QueryInfo>> => {
  return request.patch(V1.video_stream, param);
};

/**
 * @desc `添加视频流信息`
 * @param param streamName addr? latitude longitude
 * @return QueryInfo
 * */
export const req_videos_post = (
  param: PartialField<Omit<videos, "streamId">, "addr">
): Promise<ReqResponse<object>> => {
  return request.post(V1.video_stream, param);
};

/**
 * @desc `批量修改视频流信息`
 * @param param Array{streamName addr? latitude? longitude?}
 * @return QueryInfo
 * */
export const req_videos_settings = (
  param: PartialField<Omit<videos, "streamId">, "addr">[]
): Promise<ReqResponse<QueryInfo>> => {
  return request.post(V1.video_settings, param);
};

/**
 * @desc `删除视频流信息`
 * @param query streamId | streamName
 * @return QueryInfo
 * */
export const req_videos_delete = (
  query: Stringify<Omit<videos, "longitude" | "latitude" | "addr">>
): Promise<ReqResponse<QueryInfo>> => {
  return request.delete(buildQuery(V1.video_stream, query));
};

/**
 * @desc `获取行为枚举`
 * @param query actionId or actionName | null(all)
 * @return actions[]
 * */
export const req_actions_get = (
  query?: Stringify<Partial<actions>>
): Promise<ReqResponse<actions[]>> => {
  return request.get(buildQuery(V1.actions_enum, query));
};

/**
 * @desc `获取行为记录`
 * @param query (streamId or streamName) & from & to | null
 * @return records[]
 **/
export const req_records_get = (query?: RecordsQuery): Promise<ReqResponse<CarRecord[]>> => {
  return request.get(buildQuery(V1.records, query));
};

/**
 * @desc `获取行为分类统计`
 * @param query (streamId or streamName) & from & to | null(all)
 * @return number(count)[actionsId]
 * */
export const req_category_get = (query?: RecordsQuery): Promise<ReqResponse<number[]>> => {
  return request.get(buildQuery(V1.category, query));
};

/**
 * @desc `按分钟获取行为分类统计`
 * @param query (streamId or streamName or null) & from & to & gap(Minute)
 * @return number(count)[gap][actionsId]
 * */
export const req_category_minute_get = (
  query: RecordsQuery & { gap: string }
): Promise<ReqResponse<number[][]>> => {
  return request.get(buildQuery(V1.category_minute, query));
};

/**
 * @desc `Records Param`
 * @define (streamId or streamName) & from & to | null
 * */
export type RecordsQuery = {
  streamId?: string;
  streamName?: string;
  from: string;
  to: string;
};

export interface QueryInfo {
  rowsAffected: number;
}
