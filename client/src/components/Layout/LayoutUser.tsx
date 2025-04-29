import { type FC, memo, MouseEventHandler, useRef } from "react";
import { Avatar, Button, Tooltip, ConfigProvider } from "antd";
import {
  FullscreenExitOutlined,
  LogoutOutlined,
  ReloadOutlined,
  SunOutlined,
  FullscreenOutlined,
  MoonOutlined
} from "@ant-design/icons";
import "./LayoutUser.scss";
import { createStyleSheet } from "@/utils/createStyleSheet.ts";
import { useFullScreenReact } from "@/hooks/useFullScreen.ts";
import { useDarkModeReact } from "@/hooks/useDarkMode.ts";
import { createAntdTheme } from "@/utils/createAntdTheme.ts";

interface props {
  reload: () => void;
}

const LayoutUser: FC<props> = ({ reload }) => {
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
          <Tooltip title="刷新">
            <Button type="text"
                    shape="circle"
                    onClick={reload}
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
          <Tooltip title="退出登录">
            <Button type="text"
                    shape="circle"
                    icon={<LogoutOutlined style={styles.iconColor} />}
            />
          </Tooltip>
          <Tooltip title="用户名">
            <Avatar src={"https://shiina-mahiru.cn/temp/temp_avatar_2.jpg"} />
          </Tooltip>
        </ConfigProvider>
      </div>
    </>
  );
};
export default memo(LayoutUser);
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
