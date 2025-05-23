import { type FC, memo, MouseEventHandler, useRef, useState } from "react";
import { Button, Tooltip, ConfigProvider } from "antd";
import {
  FullscreenExitOutlined,
  SettingOutlined,
  ReloadOutlined,
  SunOutlined,
  FullscreenOutlined,
  MoonOutlined
} from "@ant-design/icons";
import "./BarMenu.scss";
import { createStyleSheet } from "@/utils/createStyleSheet.ts";
import { useFullScreenReact } from "@/hooks/useFullScreen.ts";
import { useDarkModeReact } from "@/hooks/useDarkMode.ts";
import { createAntdTheme } from "@/utils/createAntdTheme.ts";
import MyModal from "@/components/MyModal.tsx";
import SettingsLayout from "@/components/Settings/SettingsLayout.tsx";

type props = object;

const BarMenu: FC<props> = () => {
  const { isDark, darkAnimate } = useDarkModeReact();
  const [isFull, changeFullscreen] = useFullScreenReact();
  const darkModeRef = useRef<HTMLButtonElement>(null);
  const changeMode: MouseEventHandler<HTMLButtonElement> = (e) => {
    darkAnimate(e.nativeEvent.clientX, e.nativeEvent.clientY, isDark);
  };
  const [openSettings, setOpenSettings] = useState(false);
  return (
    <>
      <div
        className="flex items-center justify-end layout-user-container"
        style={{ height: "var(--layout-bar-height)" }}>
        <ConfigProvider theme={theme.All}>
          <Tooltip title="设置">
            <Button
              type="text"
              shape="circle"
              icon={<SettingOutlined style={styles.iconColor} />}
              onClick={() => {
                setOpenSettings(true);
              }}
            />
          </Tooltip>
          <Tooltip title="刷新">
            <Button
              type="text"
              shape="circle"
              onClick={() => {
                window.location.reload();
              }}
              icon={<ReloadOutlined style={styles.iconColor} />}
            />
          </Tooltip>
          <Tooltip title="全屏">
            <Button
              type="text"
              shape="circle"
              onClick={changeFullscreen}
              icon={
                isFull ? (
                  <FullscreenExitOutlined style={styles.iconColor} />
                ) : (
                  <FullscreenOutlined style={styles.iconColor} />
                )
              }
            />
          </Tooltip>
          <Tooltip title={isDark ? "切换日间模式" : "切换夜间模式"}>
            <Button
              type="text"
              shape="circle"
              ref={darkModeRef}
              onClick={changeMode}
              icon={
                isDark ? (
                  <MoonOutlined style={styles.iconColor} />
                ) : (
                  <SunOutlined style={styles.iconColor} />
                )
              }
            />
          </Tooltip>
        </ConfigProvider>
      </div>
      <MyModal
        title={"设置"}
        open={openSettings}
        onCancel={() => {
          setOpenSettings(false);
        }}
        onOk={() => {
          setOpenSettings(false);
        }}>
        <SettingsLayout refresh={() => {}} />
      </MyModal>
    </>
  );
};
export default memo(BarMenu);
const styles = createStyleSheet({
  iconColor: {
    color: "var(--layout-bar-color)"
  }
});
const theme = createAntdTheme({
  All: {
    Tooltip: {
      colorBgSpotlight: "var(--layout-bar-btn-tooltip-bgColor)",
      colorTextLightSolid: "var(--layout-bar-btn-tooltip-textColor)"
    }
  }
});
