import api from "@/assets/settings/api.svg";
import apiWhite from "@/assets/settings/api_white.svg";
import network from "@/assets/settings/network.svg";
import networkWhite from "@/assets/settings/network_white.svg";
import stream from "@/assets/settings/stream.svg";
import streamWhite from "@/assets/settings/stream_white.svg";
import RTC from "@/assets/settings/webRTC.svg";
import RTCWhite from "@/assets/settings/webRTC_white.svg";
import defaultIcon from "@/assets/settings/default.svg";
import dot from "@/assets/settings/dot.svg";
import dotWhite from "@/assets/settings/dot_white.svg";
import link from "@/assets/settings/link.svg";
import linkWhite from "@/assets/settings/link_white.svg";
import source from "@/assets/settings/source.svg";
import sourceWhite from "@/assets/settings/source_white.svg";
import { FC, memo } from "react";
import { AimOutlined } from "@ant-design/icons";
import { createStyleSheet } from "@/utils/createStyleSheet";

type props = {
  name: string;
};
const SettingsIcon: FC<props> = ({ name }) => {
  const render = () => {
    switch (name) {
      case "api":
        return <img src={apiWhite} alt="" style={styles.Level1} />;
      case "apiWhite":
        return <img src={apiWhite} alt="" style={styles.Level1} />;
      case "rtsp":
        return <img src={networkWhite} alt="" style={styles.Level1} />;
      case "rtspWhite":
        return <img src={networkWhite} alt="" style={styles.Level1} />;
      case "streams":
        return <img src={streamWhite} alt="" style={styles.Level1} />;
      case "streamsWhite":
        return <img src={streamWhite} alt="" style={styles.Level1} />;
      case "webrtc":
        return <img src={RTCWhite} alt="" style={styles.Level1} />;
      case "webrtcWhite":
        return <img src={RTCWhite} alt="" style={styles.Level1} />;
      case "dot":
        return <img src={dotWhite} alt="" style={styles.Level2} />;
      case "dotWhite":
        return <img src={dotWhite} alt="" style={styles.Level2} />;
      case "link":
        return <img src={linkWhite} alt="" style={styles.Level2} />;
      case "linkWhite":
        return <img src={linkWhite} alt="" style={styles.Level2} />;
      case "origin":
        return <img src={sourceWhite} alt="" style={styles.Level2} />;
      case "originWhite":
        return <img src={sourceWhite} alt="" style={styles.Level2} />;
      case "listen":
        return <AimOutlined style={{ ...styles.Level2, scale: 1.2 }} />;
      case "listenWhite":
        return <AimOutlined color={"white"} style={{ ...styles.Level2, scale: 1.2 }} />;
      default:
        return <img src={defaultIcon} alt="" style={styles.Level1} />;
    }
  };
  return <>{render()}</>;
};
export default memo(SettingsIcon);
const styles = createStyleSheet({
  Level1: {
    width: "1rem",
    height: "1rem"
  },
  Level2: {
    width: "0.75rem",
    height: "0.75rem"
  }
});
