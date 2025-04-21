import Content from "@/components/Settings/Content.tsx";
import { FC, useEffect, useState, useMemo, memo } from "react";
import { reqGetGo2rtcConfig, reqPatchGo2rtcConfig } from "@/api/moudules/go2rtcAPI.ts";
import { Button, ConfigProvider, Menu, MenuProps } from "antd";
import { AlertOutlined, LoadingOutlined } from "@ant-design/icons";
import { type Updater, useImmer } from "use-immer";
import { SettingsCtx } from "@/components/Settings/ctx.ts";
import { createStyleSheet } from "@/utils/createStyleSheet.ts";
import { JsonToYaml } from "@/utils/handleYaml.ts";

interface props {
  refresh: () => void;
}

type MenuItem = Required<MenuProps>["items"][number];

const Config: FC<props> = ({ refresh }) => {
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
    let isMounted = true;
    reqGetGo2rtcConfig().then((res) => {
      if (isMounted) {
        setConfig(res);
        setIsReqFall(false);
      }
    }).catch(() => {
      if (isMounted) setIsReqFall(true);
    });
    return () => {
      isMounted = false;
    };
  }, [setConfig]);
  const [isReqFall, setIsReqFall] = useState(false);
  const saveConfig = async () => {
    if (config?.data) {
      try {
        const yaml = JsonToYaml(config.data);
        console.log(yaml);
        await reqPatchGo2rtcConfig(yaml);
        refresh();
      } catch (e) {
        console.log(e);
      }
    }
  };
  return (
    <>
      <div
        className="grid grid-rows-[minmax(0,1fr)_auto] grid-cols-1 h-full w-full"
      >
        {
          config && (
            <>
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
                  <Menu
                    onClick={({ key }) => setCurrent(key)}
                    selectedKeys={[current]}
                    mode="vertical"
                    items={menuItems}
                    key={current}
                    className="select-none"
                  />
                </ConfigProvider>
                <div>
                  <SettingsCtx.Provider value={{
                    updater: setConfig as Updater<Go2rtcConfigYaml>,
                    currentTabs: current,
                    currentItem: ""
                  }}>
                    <Content data={config.data[current]} key={current} />
                  </SettingsCtx.Provider>
                </div>
              </div>
              <div className="w-full flex flex-row justify-end items-center">
                <Button variant="link" color="blue" onClick={refresh}>
                  刷新
                </Button>
                <Button variant="solid" color="blue" style={styles.saveBtn} onClick={saveConfig}>
                  保存
                </Button>
              </div>
            </>
          )
        }
        {
          !config &&
          <div className="flex justify-center items-center w-full h-full">
            {
              isReqFall ?
                "加载失败！请检查网络或者重新登录。" :
                <LoadingOutlined style={styles.loadingIcon} />
            }
          </div>
        }
      </div>
    </>
  );
};
export default memo(Config);

const styles = createStyleSheet({
  loadingIcon: {
    fontSize: "2rem",
    color: "var(--settings-loadingIcon-color)"
  },
  saveBtn: {
    marginLeft: "1rem"
  }
});
