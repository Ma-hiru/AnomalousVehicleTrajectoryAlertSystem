type ReqResponse<T> = {
  code: number;
  ok: boolean;
  message: string;
  data: T;
}
type Go2rtcConfigYaml = {
  data: Record<string, Record<string, string | string[]>> | null;
  content: string;
}
