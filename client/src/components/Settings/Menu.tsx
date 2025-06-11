import { FC, useCallback, useMemo } from "react";
import { MyState, useMyState } from "@/hooks/useMyState";
import SettingsIcon from "@/components/Settings/SettingsIcon";
import "./Menu.scss";
import { MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { ConfigProvider, Tooltip } from "antd";
import { createAntdTheme } from "@/utils/createAntdTheme";
import AddMenu from "@/components/Settings/AddMenu";
import { useDarkModeReact } from "@/hooks/useDarkMode";
import AppSettings from "@/settings";

type props = {
  config: MyState<Go2rtcConfigYaml | undefined>;
  currentContent: MyState<string | string[]>;
  currentIndex: MyState<string[]>;
};
const _ = undefined;
const subMenuPrefixIcon = (active: boolean, level1: string, level2: string, isDark: boolean) => {
  if (isDark) {
    if (active)
      return (
        <SettingsIcon
          name={level1 === AppSettings.STREAMS_CONF_NAME ? "linkWhite" : level2 + "White"}
        />
      );
    else
      return (
        <SettingsIcon
          name={level1 === AppSettings.STREAMS_CONF_NAME ? "linkWhite" : level2 + "White"}
        />
      );
  } else {
    if (active)
      return (
        <SettingsIcon
          name={level1 === AppSettings.STREAMS_CONF_NAME ? "linkWhite" : level2 + "White"}
        />
      );
    else return <SettingsIcon name={level1 === AppSettings.STREAMS_CONF_NAME ? "link" : level2} />;
  }
};
const Menu: FC<props> = ({ config, currentContent, currentIndex }) => {
  const { isDark } = useDarkModeReact();
  const configContent = useMemo(() => {
    if (config.get() && config.get()!.data) return config.get()!.data;
  }, [config]);
  const openAddItemModal = useMyState(false);
  const removeItem = useCallback(
    (level1: string, level2: string) => {
      config.set((draft) => {
        if (draft && draft.data) {
          delete draft.data[level1][level2];
        }
      });
    },
    [config]
  );

  const MenuTree = useMemo(() => {
    if (configContent) {
      let firstSet = true;
      return Object.keys(configContent).map((level1) => (
        <li key={level1}>
          <details
            open
            onClick={(e) => {
              e.stopPropagation();
            }}>
            <summary id="menu-summary" style={{ color: "var(--settings-content-text-color)" }}>
              {<SettingsIcon name={isDark ? level1 + "White" : level1} />}
              {level1}
              {level1 === "streams" && (
                <ConfigProvider theme={theme.AddItemTooltip}>
                  <Tooltip title={"增加视频流"} mouseEnterDelay={0.2} placement={"right"}>
                    <PlusCircleOutlined
                      className="add-item"
                      id="add-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        openAddItemModal.set(true);
                      }}
                    />
                  </Tooltip>
                </ConfigProvider>
              )}
            </summary>
            <ul>
              {Object.keys(configContent[level1]).map((level2) => {
                if (currentIndex.get().length === 0 && firstSet) {
                  setTimeout(() => {
                    currentIndex.set([level1, level2]);
                    currentContent.set(configContent![level1][level2]);
                  });
                  firstSet = false;
                }
                const active = currentIndex.get().join(".") === `${level1}.${level2}`;
                return (
                  <li
                    key={level2}
                    onClick={() => {
                      currentContent.set(configContent[level1][level2]);
                      currentIndex.set([level1, level2]);
                    }}
                    className="mt-1 mb-1"
                    style={{
                      background: "var(--settings-menu-default-bg)",
                      color: "var(--settings-menu-default-color)"
                    }}>
                    <a
                      id="menu-item"
                      className={active ? "active" : ""}
                      style={
                        active
                          ? {
                              background: "var(--settings-menu-actived-bg)",
                              color: "var(--settings-menu-actived-color)"
                            }
                          : undefined
                      }>
                      {subMenuPrefixIcon(active, level1, level2, isDark)}
                      <span>{level2}</span>
                      {level1 === AppSettings.STREAMS_CONF_NAME && (
                        <ConfigProvider theme={theme.RemoveItemTooltip}>
                          <Tooltip
                            title={"删除视频流" + level2}
                            mouseEnterDelay={0.2}
                            placement={"right"}>
                            <MinusCircleOutlined
                              className="remove-item"
                              id={active ? "remove-item-actived" : _}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeItem(level1, level2);
                              }}
                            />
                          </Tooltip>
                        </ConfigProvider>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </details>
        </li>
      ));
    }
  }, [configContent, currentContent, currentIndex, isDark, openAddItemModal, removeItem]);

  // noinspection com.intellij.reactbuddy.ArrayToJSXMapInspection
  return (
    <>
      <div className="settings-menu-container">
        <ul className="menu menu-xs bg-transparent rounded-lg  max-w-xs w-full min-w-36">
          {MenuTree}
        </ul>
      </div>
      <AddMenu
        openAddItemModal={openAddItemModal}
        config={config}
        currentContent={currentContent}
        currentIndex={currentIndex}
      />
    </>
  );
};
export default Menu;
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
