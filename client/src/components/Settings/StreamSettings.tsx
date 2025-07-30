import { FC, ReactNode, useCallback, useEffect, useLayoutEffect } from "react";
import { Typography } from "antd";
import SettingsIcon from "@/components/Settings/SettingsIcon";
import SelectMap from "@/components/Map/SelectMap";
import { useDarkModeReact } from "@/hooks/useDarkMode";
import AppSettings from "@/settings";
import { useImmer } from "use-immer";
import { useShallow } from "zustand/react/shallow";
import { useSettingsZustandStore } from "@/stores/zustand/settings";

type props = {
  children?: ReactNode;
  streamName: string;
};

const StreamSettings: FC<props> = ({ children, streamName }) => {
  const [position, setPosition] = useImmer<StreamPosition>({
    name: "",
    latitude: 0,
    longitude: 0
  });
  const { modifiedVideos } = useSettingsZustandStore(
    useShallow((state) => ({
      modifiedVideos: state.modifiedVideos
    }))
  );
  useEffect(() => {
    setPosition({
      name: streamName,
      latitude: modifiedVideos.get(streamName)?.latitude || 0,
      longitude: modifiedVideos.get(streamName)?.longitude || 0
    });
  }, [modifiedVideos, setPosition, streamName]);
  const { isDark } = useDarkModeReact();
  return (
    <>
      <div className="grid grid-cols-[auto_1fr] grid-rows-1 h-full">
        <section className="flex flex-col justify-start items-start h-full ">
          <div>
            <Typography.Title
              level={4}
              className="select-none"
              style={{ color: "var(--settings-content-text-color)" }}>
              <span className="mr-2">
                <SettingsIcon
                  name={
                    isDark ? AppSettings.STREAMS_CONF_NAME + "White" : AppSettings.STREAMS_CONF_NAME
                  }
                />
              </span>
              视频流地址
            </Typography.Title>
            {children}
          </div>
          <div>
            <Typography.Title
              level={4}
              className="select-none"
              style={{ color: "var(--settings-content-text-color)" }}>
              <span className="mr-2">
                <SettingsIcon
                  name={
                    isDark ? AppSettings.STREAMS_CONF_NAME + "White" : AppSettings.STREAMS_CONF_NAME
                  }
                />
              </span>
              视频源位置
            </Typography.Title>
            <div
              className="mockup-code bg-transparent text-black"
              style={{ color: "var(--settings-content-text-color)" }}>
              <pre data-prefix={1}>
                <code>
                  <span>经度：{position.longitude}</span>
                </code>
              </pre>
              <pre data-prefix={2}>
                <code>
                  <span>纬度：{position.latitude}</span>
                </code>
              </pre>
            </div>
          </div>
        </section>
        <SelectMap position={position} />
      </div>
    </>
  );
};
export default StreamSettings;
