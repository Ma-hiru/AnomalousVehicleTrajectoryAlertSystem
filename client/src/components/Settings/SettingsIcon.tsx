import api from "@/assets/settings/api.svg";
import network from "@/assets/settings/network.svg";
import stream from "@/assets/settings/stream.svg";
import RTC from "@/assets/settings/webRTC.svg";
import defaultIcon from "@/assets/settings/default.svg";
import dot from "@/assets/settings/dot.svg";
import dotWhite from "@/assets/settings/dot_white.svg";
import { FC, memo } from "react";

type props = {
  name: string;
}
const SettingsIcon: FC<props> = ({ name }) => {
  const render = () => {
    switch (name) {
      case "api":
        return <img src={api} alt="" style={{ width: 15, height: 15 }} />;
      case "rtsp":
        return <img src={network} alt="" style={{ width: 15, height: 15 }} />;
      case "streams":
        return <img src={stream} alt="" style={{ width: 15, height: 15 }} />;
      case "webrtc":
        return <img src={RTC} alt="" style={{ width: 15, height: 15 }} />;
      case "dot":
        return <img src={dot} alt="" style={{ width: 10, height: 10 }} />;
      case "dotWhite":
        return <img src={dotWhite} alt="" style={{ width: 10, height: 10 }} />;
      default:
        return <img src={defaultIcon} alt="" style={{ width: 15, height: 15 }} />;
    }
  };
  return <>
    {render()}
  </>;
};
export default memo(SettingsIcon);
