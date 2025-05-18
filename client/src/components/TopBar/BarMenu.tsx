import { type FC, memo, MouseEventHandler, useRef } from "react";
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

type props = object

const BarMenu: FC<props> = () => {
  const [isDark, changeDarkMode] = useDarkModeReact();
  const [isFull, changeFullscreen] = useFullScreenReact();
  const darkModeRef = useRef<HTMLButtonElement>(null);
  const changeMode: MouseEventHandler<HTMLButtonElement> = (e) => {
    const pos = {
      x: e.nativeEvent.clientX,
      y: e.nativeEvent.clientY
    };
    const Animate = () => {
      const radius = Math.hypot(
        Math.max(pos.x, window.innerWidth - pos.x),
        Math.max(pos.y, window.innerHeight - pos.y)
      );
      const clipPath = [
        `circle(0px at ${pos.x}px ${pos.y}px)`,
        `circle(${radius}px at ${pos.x}px ${pos.y}px)`
      ];
      document.documentElement.animate(
        { clipPath: isDark ? clipPath.reverse() : clipPath },
        {
          duration: 600,
          pseudoElement: isDark
            ? "::view-transition-old(root)"
            : "::view-transition-new(root)"
        }
      );
    };
    document.startViewTransition
      ? document.startViewTransition(changeDarkMode).ready.then(Animate)
      : changeDarkMode();
  };
  return (
    <>
      <div className="flex items-center layout-user-container"
           style={{ height: "var(--layout-bar-height)" }}>
        <ConfigProvider theme={theme.All}>
          <Tooltip title="设置">
            <Button type="text"
                    shape="circle"
                    icon={<SettingOutlined style={styles.iconColor} />}
            />
          </Tooltip>
          <Tooltip title="刷新">
            <Button type="text"
                    shape="circle"
                    onClick={() => {
                      window.location.reload();
                    }}
                    icon={<ReloadOutlined style={styles.iconColor} />}
            />
          </Tooltip>
          <Tooltip title="全屏">
            <Button type="text"
                    shape="circle"
                    onClick={changeFullscreen}
                    icon={isFull ? <FullscreenExitOutlined style={styles.iconColor} /> :
                      <FullscreenOutlined style={styles.iconColor} />}
            />
          </Tooltip>
          <Tooltip title={isDark ? "切换日间模式" : "切换夜间模式"}>
            <Button type="text"
                    shape="circle"
                    ref={darkModeRef}
                    onClick={changeMode}
                    icon={isDark ? <MoonOutlined style={styles.iconColor} /> :
                      <SunOutlined style={styles.iconColor} />}
            />
          </Tooltip>
        </ConfigProvider>
      </div>
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
