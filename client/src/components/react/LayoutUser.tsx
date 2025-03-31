import { FC, memo } from "react";
import { Avatar, Button } from "antd";
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
import { useFullScreen } from "@/hooks/useFullScreen.ts";
import { useDarkMode } from "@/hooks/useDarkMode.ts";

interface props {
  reload: () => void;
}

const LayoutUser: FC<props> = ({ reload }) => {
  const [isDark, changeDarkMode] = useDarkMode();
  const [isFull, changeFullscreen] = useFullScreen();
  return (
    <>
      <div className="flex items-center layout-user-container"
           style={{ height: "var(--layout-bar-height)" }}>
        <Button type="text"
                shape="circle"
                onClick={reload}
                icon={<ReloadOutlined style={styles.iconColor} />}
        />
        <Button type="text"
                shape="circle"
                onClick={changeFullscreen}
                icon={isFull ? <FullscreenExitOutlined style={styles.iconColor} /> :
                  <FullscreenOutlined style={styles.iconColor} />}
        />
        <Button type="text"
                shape="circle"
                onClick={changeDarkMode}
                icon={isDark ? <MoonOutlined style={styles.iconColor} /> :
                  <SunOutlined style={styles.iconColor} />}
        />
        <Button type="text"
                shape="circle"
                icon={<LogoutOutlined style={styles.iconColor} />}
        />
        <Avatar />
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
