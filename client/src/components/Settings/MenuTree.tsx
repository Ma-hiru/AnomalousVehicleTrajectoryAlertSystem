import { FC, memo, useLayoutEffect, useState } from "react";
import SettingsIcon from "@/components/Settings/SettingsIcon";
import { ConfigProvider, Tooltip } from "antd";
import { MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import AppSettings from "@/settings";
import { createAntdTheme } from "@/utils/createAntdTheme";
import { Updater } from "use-immer";
import { useSettingsZustandStore } from "@/stores/zustand/settings";
import { useShallow } from "zustand/react/shallow";

interface props {
  config: Go2rtcConfigYaml | undefined;
  setModalShow: Updater<boolean>;
  currentIndex: [level1: string, level2: string];
  setCurrentContent: Updater<string | string[]>;
  setCurrentIndex: Updater<[level1: string, level2: string]>;
  removeItem: (level1: string, level2: string) => void;
}

const MenuTree: FC<props> = ({
  config,
  setModalShow,
  currentIndex,
  setCurrentIndex,
  setCurrentContent,
  removeItem
}) => {
  const configContent = config?.data;
  const [firstSet, setFirstSet] = useState(true);
  useLayoutEffect(() => {
    console.log(configContent && currentIndex[0] === "" && currentIndex[1] === "" && firstSet);
    if (configContent && currentIndex[0] === "" && currentIndex[1] === "" && firstSet) {
      const initialLevel1 = Object.keys(configContent)[0];
      const initialLevel2 = Object.keys(configContent[initialLevel1])[0];
      setCurrentIndex([initialLevel1, initialLevel2]);
      setCurrentContent(configContent![initialLevel1][initialLevel2]);
      setFirstSet(false);
    }
  }, [configContent, currentIndex, firstSet, setCurrentContent, setCurrentIndex]);
  return (
    <>
      {configContent &&
        Object.keys(configContent).map((level1) => (
          <li key={level1}>
            <details
              open
              onClick={(e) => {
                e.stopPropagation();
              }}>
              <summary id="menu-summary" style={{ color: "var(--settings-content-text-color)" }}>
                {<SettingsIcon name={level1} />}
                {level1}
                {level1 === "streams" && <AddStreamBtn open={setModalShow} />}
              </summary>
              <ul>
                {Object.keys(configContent[level1]).map((level2) => {
                  const active = currentIndex.join(".") === `${level1}.${level2}`;
                  return (
                    <li
                      key={level2}
                      onClick={() => {
                        setCurrentContent(configContent[level1][level2]);
                        setCurrentIndex([level1, level2]);
                      }}
                      className="mt-1 mb-1"
                      style={{
                        background: "var(--settings-menu-default-bg)",
                        color: "var(--settings-menu-default-color)"
                      }}>
                      <a
                        id="menu-item"
                        className={active ? "active" : _}
                        style={
                          active
                            ? {
                                background: "var(--settings-menu-actived-bg)",
                                color: "var(--settings-menu-actived-color)"
                              }
                            : _
                        }>
                        {subMenuPrefixIcon(active, level1, level2)}
                        <span>{level2}</span>
                        {level1 === AppSettings.STREAMS_CONF_NAME && (
                          <DelStreamBtn level2={level2} active={active} deleteItem={removeItem} />
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </details>
          </li>
        ))}
    </>
  );
};
export default memo(MenuTree);

const AddStreamBtn: FC<{ open: Updater<boolean> }> = ({ open }) => {
  return (
    <ConfigProvider theme={theme.AddItemTooltip}>
      <Tooltip title="增加视频流" mouseEnterDelay={0.2} placement="right">
        <PlusCircleOutlined
          className="add-item"
          id="add-item"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            open(true);
          }}
        />
      </Tooltip>
    </ConfigProvider>
  );
};
const DelStreamBtn: FC<{
  active: boolean;
  level2: string;
  deleteItem: (level1: string, level2: string) => void;
}> = ({ active, level2, deleteItem }) => {
  const { removeModifiedVideos } = useSettingsZustandStore(
    useShallow((state) => ({
      removeModifiedVideos: state.removeModifiedVideos
    }))
  );
  return (
    <ConfigProvider theme={theme.RemoveItemTooltip}>
      <Tooltip title={"删除视频流" + level2} mouseEnterDelay={0.2} placement={"right"}>
        <MinusCircleOutlined
          className="remove-item"
          id={active ? "remove-item-actived" : _}
          onClick={(e) => {
            e.stopPropagation();
            deleteItem(AppSettings.STREAMS_CONF_NAME, level2);
            removeModifiedVideos(level2);
          }}
        />
      </Tooltip>
    </ConfigProvider>
  );
};
const _ = undefined;
const subMenuPrefixIcon = (active: boolean, level1: string, level2: string) => {
  if (active)
    return (
      <SettingsIcon
        name={level1 === AppSettings.STREAMS_CONF_NAME ? "linkWhite" : level2 + "White"}
      />
    );
  else return <SettingsIcon name={level1 === AppSettings.STREAMS_CONF_NAME ? "link" : level2} />;
};
const theme = createAntdTheme({
  RemoveItemTooltip: {
    Tooltip: {
      colorBgSpotlight: "var(--settings-content-removeItem-tooltip)",
      colorTextLightSolid: "var(--settings-content-removeItem-tooltip-color)"
    }
  },
  AddItemTooltip: {
    Tooltip: {
      colorBgSpotlight: "var(--settings-content-addItem-tooltip)",
      colorTextLightSolid: "var(--settings-content-addItem-tooltip-color)"
    }
  }
});
