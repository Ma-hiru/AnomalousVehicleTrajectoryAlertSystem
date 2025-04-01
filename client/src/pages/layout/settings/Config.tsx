import Content from "@/pages/layout/settings/Content.tsx";
import { FC, useEffect, useState, useMemo, memo } from "react";
import { reqGetGo2rtcConfig } from "@/api/moudules/go2rtcAPI.ts";
import { ConfigProvider, Menu, MenuProps } from "antd";
import { AlertOutlined } from "@ant-design/icons";
import { type Updater, useImmer } from "use-immer";
import { SettingsCtx } from "@/pages/layout/settings/ctx.ts";

interface props {
  /* empty */
}

type MenuItem = Required<MenuProps>["items"][number];

const Config: FC<props> = () => {
  const [config, setConfig] = useImmer<Go2rtcConfigYaml | undefined>(undefined);
  const [current, setCurrent] = useState("streams");
  const menuItems: MenuItem[] | undefined = useMemo(() => config &&
      Object.keys(config?.data).map(key => ({
        label: key,
        key: key,
        icon: <AlertOutlined />
      }))
    , [config]);
  useEffect(() => {
    reqGetGo2rtcConfig().then(setConfig);
  }, [setConfig]);
  return (
    <>
      <div
        className="grid grid-rows-[minmax(0,1fr)_auto] grid-cols-1 h-full w-full">
        <div
          className="grid grid-rows-1 grid-cols-[var(--settings-divider-ratio)] h-full w-full">
          <ConfigProvider theme={{
            components: {
              Menu: {
                itemColor: "var(--settings-tabs-color)",
                itemSelectedColor: "var(--settings-tabs-active-color)",
                itemHoverColor: "var(--settings-tabs-active-color)"
              }
            }
          }}>
            <Menu onClick={({ key }) => setCurrent(key)}
                  selectedKeys={[current]}
                  mode="vertical"
                  items={menuItems}
                  key={current}
            />
          </ConfigProvider>
          <div>
            {
              config &&
              <SettingsCtx.Provider value={{
                updater: setConfig as Updater<Go2rtcConfigYaml>,
                currentTabs: current,
                currentItem: ""
              }}>
                <Content data={config.data[current]} key={current} />
              </SettingsCtx.Provider>
            }
          </div>
        </div>
        <div className="w-full flex justify-end items-center">1</div>
      </div>
    </>
  );
};
export default memo(Config);
