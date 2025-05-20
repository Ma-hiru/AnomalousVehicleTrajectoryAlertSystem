import { FC, ReactNode } from "react";
import { Typography } from "antd";
import SettingsIcon from "@/components/Settings/SettingsIcon.tsx";
import SelectMap from "@/components/Map/SelectMap.tsx";
import { useMyState } from "@/hooks/useMyState.ts";
import { useDarkModeReact } from "@/hooks/useDarkMode.ts";
import AppSettings from "@/settings";

type props = {
  children?: ReactNode;
};

const StreamSettings: FC<props> = ({ children }) => {
  const StreamPosition = useMyState<StreamPosition>({ name: "", latitude: 0, longitude: 0 });
  const {isDark} = useDarkModeReact();
  return (
    <>
      <div className="grid grid-cols-[auto_1fr] grid-rows-1 h-full">
        <section className="flex flex-col justify-start items-start h-full ">
          <div>
            <Typography.Title level={4} className="select-none"
                              style={{ color: "var(--settings-content-text-color)" }}>
              <span className="mr-2">
                <SettingsIcon
                  name={isDark ? AppSettings.STREAMS_CONF_NAME + "White" : AppSettings.STREAMS_CONF_NAME} />
              </span>
              视频流地址
            </Typography.Title>
            {children}
          </div>
          <div>
            <Typography.Title level={4} className="select-none"
                              style={{ color: "var(--settings-content-text-color)" }}>
              <span className="mr-2">
                <SettingsIcon
                  name={isDark ? AppSettings.STREAMS_CONF_NAME + "White" : AppSettings.STREAMS_CONF_NAME} />
              </span>
              视频源位置
            </Typography.Title>
            <div className="mockup-code bg-transparent text-black"
                 style={{ color: "var(--settings-content-text-color)" }}>
              <pre data-prefix={1}>
                <code>
                  <span>经度：{StreamPosition.get().longitude}</span>
                </code>
              </pre>
              <pre data-prefix={2}>
                <code>
                  <span>纬度：{StreamPosition.get().latitude}</span>
                </code>
            </pre>
            </div>
          </div>
        </section>
        <SelectMap position={StreamPosition} />
      </div>
    </>
  );
};
export default StreamSettings;
