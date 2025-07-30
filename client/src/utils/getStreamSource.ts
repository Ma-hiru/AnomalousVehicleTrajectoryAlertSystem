import { baseUrl } from "@/settings/settings.api";

export const GetStreamSource = (list: videos[]) => {
  const url = baseUrl.replace("http", "ws").replace("https", "wss");
  return list.reduce(
    (pre, cur) => {
      pre.push({
        stream: `${url}/api/go2rtc/ws?src=${cur.streamName}`,
        frame: `${url}/api/gin/frames?name=${cur.streamName}`
      });
      return pre;
    },
    <{ stream: string; frame: string }[]>[]
  );
};
