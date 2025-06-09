import { type FC, memo, useCallback, useState } from "react";
import { Button, ConfigProvider } from "antd";
import {
  FullscreenExitOutlined,
  SettingOutlined,
  ReloadOutlined,
  FullscreenOutlined
} from "@ant-design/icons";
import { createStyleSheet } from "@/utils/createStyleSheet";
import { useFullScreenReact } from "@/hooks/useFullScreen";
import { createAntdTheme } from "@/utils/createAntdTheme";
import MyModal from "@/components/MyModal";
import SettingsLayout from "@/components/Settings/SettingsLayout";
import styled from "styled-components";
import OnHover from "@/components/Ani/OnHover";

interface props {
  setActiveTitle?: (title: string) => void;
}

const BarMenu: FC<props> = ({ setActiveTitle }) => {
  const [isFull, changeFullscreen] = useFullScreenReact();
  const [showSettings, setShowSettings] = useState(false);
  const reload = useCallback(() => {
    window.location.reload();
  }, []);
  const openSettings = useCallback(() => {
    setShowSettings(true);
  }, []);
  const setTitle = useCallback(
    (title: string) => {
      setActiveTitle && setActiveTitle(title);
    },
    [setActiveTitle]
  );
  return (
    <>
      <MenuContainer>
        <ConfigProvider theme={theme.All}>
          <OnHover scale={1.5}>
            <Button
              type="text"
              shape="circle"
              size="large"
              icon={<SettingOutlined style={styles.iconColor} size={16} />}
              onClick={openSettings}
              onMouseOver={() => {
                setTitle("设置");
              }}
            />
          </OnHover>
          <OnHover scale={1.5}>
            <Button
              type="text"
              shape="circle"
              size="large"
              onClick={reload}
              onMouseOver={() => {
                setTitle("刷新");
              }}
              icon={<ReloadOutlined style={styles.iconColor} size={16} />}
            />
          </OnHover>
          <OnHover scale={1.5}>
            <Button
              type="text"
              shape="circle"
              size="large"
              onClick={changeFullscreen}
              onMouseOver={() => {
                setTitle("全屏");
              }}
              icon={
                isFull ? (
                  <FullscreenExitOutlined style={styles.iconColor} size={16} />
                ) : (
                  <FullscreenOutlined style={styles.iconColor} size={16} />
                )
              }
            />
          </OnHover>
        </ConfigProvider>
      </MenuContainer>
      <MyModal
        title={"设置"}
        open={showSettings}
        onCancel={() => {
          setShowSettings(false);
        }}
        onOk={() => {
          setShowSettings(false);
        }}>
        <SettingsLayout refresh={() => {}} />
      </MyModal>
    </>
  );
};
export default memo(BarMenu);
const MenuContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
`;
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
