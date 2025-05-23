type ReqResponse<T> = {
  code: number;
  ok: boolean;
  message: string;
  data: T;
};
type Go2rtcConfigYaml = {
  data: Record<string, Record<string, string | string[]>> | null;
  content: string;
};

type StreamInfoResponse = Record<string, StreamInfo>;
type StreamInfo = {
  producers: Producers[];
  consumers?: Consumers[];
};
type Producers = {
  id?: number;
  format_name?: string;
  protocol?: string;
  remote_addr?: string;
  source?: string;
  url: string;
  sdp?: string;
  user_agent?: string;
  medias?: string[];
  receivers?: Receivers[];
  bytes_recv?: number;
};
type Receivers = {
  id: number;
  codec: Codec;
  childs: number[];
  bytes: number;
  packets: number;
};
type Codec =
  | {
      codec_name: string;
      codec_type: "video";
      level: number;
      profile: string;
    }
  | {
      channels: 2;
      codec_name: string;
      codec_type: "audio";
      sample_rate: 44100;
    };
type Consumers = {
  id: number;
  format_name: string;
  protocol: string;
  remote_addr: string;
  user_agent: string;
  medias: string[];
  senders: Senders[];
  bytes_send: number;
};
type Senders = {
  id: number;
  codec: Codec;
  parent: number;
  bytes: number;
  packets: number;
};

//TODO
type StreamSimple = {
  name: string;
  url: string[];
};
type Stream = StreamSimple & {};
type StreamSimpleList = StreamSimple[];
type StreamList = Stream[];
