import { FC, ReactNode } from "react";
import { Typography } from "antd";
import SettingsIcon from "@/components/Settings/SettingsIcon.tsx";
import SelectMap from "@/components/Map/SelectMap.tsx";
import { useMyState } from "@/hooks/useMyState.ts";

type props = {
  children?: ReactNode;
};
const STREAMS = "streams";
const StreamSettings: FC<props> = ({ children }) => {
  const StreamPosition = useMyState<StreamPosition>({ name: "", latitude: 0, longitude: 0 });
  return (
    <>
      <div className="grid grid-cols-[auto_1fr] grid-rows-1 h-full">
        <section className="flex flex-col justify-start items-start h-full ">
          <div>
            <Typography.Title level={4}>
              <span className="mr-2">
                <SettingsIcon name={STREAMS} />
              </span>
              视频流地址
            </Typography.Title>
            {children}
          </div>
          <div>
            <Typography.Title level={4}>
              <span className="mr-2">
                <SettingsIcon name={STREAMS} />
              </span>
              视频源位置
            </Typography.Title>
            <div className="mockup-code bg-transparent text-black">
            <pre data-prefix={1}>
              <code>
                <span>经度：90.00</span>
              </code>
            </pre>
              <pre data-prefix={2}>
              <code>
                <span>纬度：90.00</span>
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
