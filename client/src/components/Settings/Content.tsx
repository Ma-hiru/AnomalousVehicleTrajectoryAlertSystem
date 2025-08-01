import { FC, memo } from "react";
import { Typography, Divider, ConfigProvider } from "antd";
import { createAntdTheme } from "@/utils/createAntdTheme";
import "./Content.scss";
import { FormOutlined } from "@ant-design/icons";
import SettingsIcon from "@/components/Settings/SettingsIcon";
import StreamSettings from "@/components/Settings/StreamSettings";
import { useDarkModeReact } from "@/hooks/useDarkMode";
import { Updater } from "use-immer";

interface props {
  currentContent: string | string[];
  currentIndex: string[];
  setConfig: Updater<Go2rtcConfigYaml | undefined>;
}

const STREAMS = "streams";
const Content: FC<props> = ({ currentContent, currentIndex, setConfig }) => {
  const updateConfig = (newContent: string | string[]) => {
    setConfig((draft) => {
      if (draft) {
        if (draft) {
          const level1 = currentIndex[0];
          const level2 = currentIndex[1];
          if (draft.data) {
            draft.data[level1][level2] = newContent;
          }
        }
      }
    });
  };
  const render = () => {
    if (typeof currentContent === "string") {
      return (
        <pre data-prefix={1} key={currentContent as string}>
          <code>
            <ConfigProvider theme={theme.EditItemTooltip}>
              <Typography.Paragraph
                style={{
                  display: "inline-block",
                  minWidth: "15rem",
                  color: "var(--settings-content-text-color)"
                }}
                editable={{
                  icon: (
                    <FormOutlined
                      style={{
                        color: "var(--settings-content-item-editIcon-color)",
                        marginLeft: "0.5rem"
                      }}
                    />
                  ),
                  onChange: updateConfig,
                  tooltip: <span>点击编辑</span>
                }}>
                {currentContent}
              </Typography.Paragraph>
            </ConfigProvider>
          </code>
        </pre>
      );
    } else if (typeof currentContent === "object") {
      return (currentContent as string[]).map((item, index) => {
        return (
          <pre
            data-prefix={index + 1}
            key={index + item}
            style={{ color: "var(--settings-content-text-color)" }}>
            <code>
              <ConfigProvider theme={theme.EditItemTooltip}>
                <Typography.Paragraph
                  style={{
                    display: "inline-block",
                    minWidth: "15rem",
                    color: "var(--settings-content-text-color)"
                  }}
                  editable={{
                    icon: (
                      <FormOutlined
                        style={{
                          color: "var(--settings-content-item-editIcon-color)",
                          marginLeft: "0.5rem"
                        }}
                      />
                    ),
                    tooltip: <span>编辑地址</span>,
                    onChange: (text) => {
                      const newContent = Array.from(currentContent as string[]);
                      newContent[index] = text;
                      updateConfig(newContent);
                    }
                  }}
                  id="editableText">
                  {item}
                </Typography.Paragraph>
              </ConfigProvider>
            </code>
          </pre>
        );
      });
    }
  };
  const { isDark } = useDarkModeReact();
  return (
    <>
      <div
        id="settings-content"
        className="grid grid-cols-1 grid-rows-[auto_minmax(0,1fr)] h-full ">
        <section>
          <Typography className="select-none">
            <Typography.Title
              level={4}
              className="text-right"
              style={{ color: "var(--settings-content-text-color)" }}>
              <span className="bg-[#1677ff] text-white text-sm pl-2 pr-2  font-bold">
                {currentIndex[0]}
              </span>
              <ConfigProvider theme={theme.MenuDivider}>
                <Divider type="vertical" variant="solid" />
              </ConfigProvider>
              {currentIndex[1]}
            </Typography.Title>
          </Typography>
        </section>
        <section>
          {currentIndex[0] === STREAMS && (
            <StreamSettings streamName={currentIndex[1]}>
              <div className="mockup-code bg-transparent text-black">{render()}</div>
            </StreamSettings>
          )}
          {currentIndex[0] !== STREAMS && (
            <>
              <Typography.Title
                level={4}
                className="select-none"
                style={{ color: "var(--settings-content-text-color)" }}>
                <span className="mr-2 select-none">
                  <SettingsIcon name={isDark ? currentIndex[1] + "White" : currentIndex[1]} />
                </span>
                {currentIndex[1] === "listen" ? "监听地址" : "跨域访问地址"}
              </Typography.Title>
              <div
                className="mockup-code bg-transparent text-black"
                style={{ color: "var(--settings-content-text-color)" }}>
                {render()}
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
};
export default memo(Content);

const theme = createAntdTheme({
  MenuDivider: {
    Divider: {
      colorSplit: "var(--settings-content-title-divider)"
    }
  },
  ContentDivider: {
    Divider: {
      colorSplit: "var(--settings-content-content-divider)"
    }
  },
  EditItemTooltip: {
    Tooltip: {
      colorBgSpotlight: "var(--settings-content-addItem-tooltip)",
      colorTextLightSolid: "var(--settings-content-addItem-tooltip-color)"
    }
  }
});
