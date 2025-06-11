import { FC } from "react";
import MyModal from "@/components/MyModal";
import { Input, Space } from "antd";
import { MyState, useMyState } from "@/hooks/useMyState";
import SettingsIcon from "@/components/Settings/SettingsIcon";
import AppSettings from "@/settings";

type props = {
  openAddItemModal: MyState<boolean>;
  config: MyState<Go2rtcConfigYaml | undefined>;
  currentContent: MyState<string | string[]>;
  currentIndex: MyState<string[]>;
};

const AddMenu: FC<props> = ({ openAddItemModal, config }) => {
  const stream = useMyState({
    name: "",
    stream: ""
  });
  const addItem = () => {
    const currentConfig = config.get();
    if (currentConfig && currentConfig.data) {
      if (typeof currentConfig.data[AppSettings.STREAMS_CONF_NAME] === "object") {
        currentConfig.data[AppSettings.STREAMS_CONF_NAME][stream.get().name] = [
          stream.get().stream
        ];
        config.set(currentConfig);
      }
    }
    openAddItemModal.set(false);
  };
  return (
    <>
      <MyModal
        width="unset"
        title="增加视频流"
        onCancel={() => {
          openAddItemModal.set(false);
        }}
        onOk={addItem}
        open={openAddItemModal.get()}>
        <Space direction={"vertical"} size={"middle"} style={{ width: "100%" }}>
          <Space.Compact className="w-full">
            <Input
              prefix={<SettingsIcon name="streams" />}
              placeholder="请输入视频流名称"
              allowClear
              value={stream.get().name}
              onChange={(e) => {
                stream.set((draft) => {
                  draft.name = e.target.value;
                });
              }}
            />
          </Space.Compact>
          <Space.Compact className="w-full">
            <Input
              prefix={<SettingsIcon name="link" />}
              placeholder="请输入视频流地址"
              allowClear
              value={stream.get().stream}
              onChange={(e) => {
                stream.set((draft) => {
                  draft.stream = e.target.value;
                });
              }}
            />
          </Space.Compact>
        </Space>
      </MyModal>
    </>
  );
};
export default AddMenu;
