import { FC, memo, useCallback } from "react";
import MyModal from "@/components/MyModal";
import { Input, Space, Button } from "antd";
import SettingsIcon from "@/components/Settings/SettingsIcon";
import AppSettings from "@/settings";
import { useReactive } from "ahooks";
import { Updater } from "use-immer";
import { useSettingsZustandStore } from "@/stores/zustand/settings";
import { useShallow } from "zustand/react/shallow";
import Logger from "@/utils/logger";

type props = {
  open: boolean;
  change: Updater<boolean>;
  config: Go2rtcConfigYaml | undefined;
  setConfig: Updater<Go2rtcConfigYaml | undefined>;
  update: () => void;
};

const AddMenu: FC<props> = ({ open, change, update, config, setConfig }) => {
  const input = useReactive({
    name: "",
    stream: ""
  });
  const { addModifiedVideos, modifiedVideos } = useSettingsZustandStore(
    useShallow((state) => ({
      addModifiedVideos: state.addModifiedVideos,
      modifiedVideos: state.modifiedVideos
    }))
  );
  const addItem = useCallback(() => {
    if (modifiedVideos.get(input.name)) {
      Logger.Message.Error(`${input.name} 已存在`);
      return;
    }
    if (config && config.data) {
      if (typeof config.data[AppSettings.STREAMS_CONF_NAME] === "object") {
        setConfig((draft) => {
          draft!.data![AppSettings.STREAMS_CONF_NAME][input.name] = [input.stream];
        });
        addModifiedVideos(input.name, {
          latitude: 0,
          longitude: 0
        });
        update();
        input.name = "";
        input.stream = "";
      }
    }
    change(false);
  }, [addModifiedVideos, change, config, input, modifiedVideos, setConfig, update]);
  const onCancel = useCallback(() => {
    change(false);
  }, [change]);
  return (
    <>
      <MyModal width="unset" title="增加视频流" onCancel={onCancel} open={open}>
        <Space className="w-full" direction={"vertical"} size={"middle"}>
          <Space.Compact className="w-full">
            <Input
              prefix={<SettingsIcon name="streams" />}
              placeholder="请输入视频流名称"
              allowClear
              value={input.name}
              onChange={(e) => {
                input.name = e.target.value.trim();
              }}
            />
          </Space.Compact>
          <Space.Compact className="w-full">
            <Input
              prefix={<SettingsIcon name="link" />}
              placeholder="请输入视频流地址"
              allowClear
              value={input.stream}
              onChange={(e) => {
                input.stream = e.target.value.trim();
              }}
            />
          </Space.Compact>
          <Space.Compact className="w-full justify-end">
            <Button variant="solid" color="blue" onClick={addItem}>
              添加
            </Button>
          </Space.Compact>
        </Space>
      </MyModal>
    </>
  );
};
export default memo(AddMenu);
