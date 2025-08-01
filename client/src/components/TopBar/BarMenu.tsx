import { type FC, memo, useCallback } from "react";
import { Button, ConfigProvider } from "antd";
import {
  FullscreenExitOutlined,
  SettingOutlined,
  ReloadOutlined,
  FullscreenOutlined,
  WarningOutlined
} from "@ant-design/icons";
import { createStyleSheet } from "@/utils/createStyleSheet";
import { useFullScreenReact } from "@/hooks/useFullScreen";
import { createAntdTheme } from "@/utils/createAntdTheme";
import MyModal from "@/components/MyModal";
import SettingsLayout from "@/components/Settings/SettingsLayout";
import styled from "styled-components";
import OnHover from "@/components/Ani/OnHover";
import Track from "@/components/Track/Track";
import { useReactive } from "ahooks";

interface props {
  setActiveTitle?: (title: string) => void;
}

const ICON_SIZE = 50;
const BTN_SCALE_DEFAULT = 1.2;
const BTN_SCALE_HOVER = 1.7;
const HOVER_DUR = 0.3;
const BarMenu: FC<props> = ({ setActiveTitle }) => {
  const [isFull, changeFullscreen] = useFullScreenReact();
  const reload = useCallback(() => {
    window.location.reload();
  }, []);
  const ShowModal = useReactive({
    settings: false,
    track: false
  });
  const openModal = useCallback(
    (type: "settings" | "track" | "history") => {
      switch (type) {
        case "settings":
          return () => (ShowModal.settings = true);
        case "track":
          return () => (ShowModal.track = true);
      }
    },
    [ShowModal]
  );
  const closeSettingsModal = useCallback(() => {
    ShowModal.settings = false;
  }, [ShowModal]);
  const closeTrackModal = useCallback(() => {
    ShowModal.track = false;
  }, [ShowModal]);
  const setTitle = (title: string) => {
    return () => setActiveTitle && setActiveTitle(title);
  };
  return (
    <>
      <MenuContainer>
        <ConfigProvider theme={theme.All}>
          <OnHover scale={BTN_SCALE_HOVER} defaultScale={BTN_SCALE_DEFAULT} duration={HOVER_DUR}>
            <Button
              type="text"
              shape="circle"
              size="large"
              icon={<WarningOutlined style={styles.iconColor} size={ICON_SIZE} />}
              onClick={openModal("track")}
              onMouseOver={setTitle("异常追踪")}
            />
          </OnHover>
          <OnHover scale={BTN_SCALE_HOVER} defaultScale={BTN_SCALE_DEFAULT} duration={HOVER_DUR}>
            <Button
              type="text"
              shape="circle"
              size="large"
              onClick={changeFullscreen}
              onMouseOver={setTitle("全屏")}
              icon={
                isFull ? (
                  <FullscreenExitOutlined style={styles.iconColor} size={ICON_SIZE} />
                ) : (
                  <FullscreenOutlined style={styles.iconColor} size={ICON_SIZE} />
                )
              }
            />
          </OnHover>
          <OnHover scale={BTN_SCALE_HOVER} defaultScale={BTN_SCALE_DEFAULT} duration={HOVER_DUR}>
            <Button
              type="text"
              shape="circle"
              size="large"
              icon={<SettingOutlined style={styles.iconColor} size={ICON_SIZE} />}
              onClick={openModal("settings")}
              onMouseOver={setTitle("设置")}
            />
          </OnHover>
          <OnHover scale={BTN_SCALE_HOVER} defaultScale={BTN_SCALE_DEFAULT} duration={HOVER_DUR}>
            <Button
              type="text"
              shape="circle"
              size="large"
              onClick={reload}
              onMouseOver={setTitle("刷新")}
              icon={<ReloadOutlined style={styles.iconColor} size={ICON_SIZE} />}
            />
          </OnHover>
        </ConfigProvider>
      </MenuContainer>
      <MyModal title={"设置"} open={ShowModal.settings} onCancel={closeSettingsModal}>
        <SettingsLayout />
      </MyModal>
      <MyModal title={"异常追踪"} width={"80vw"} open={ShowModal.track} onCancel={closeTrackModal}>
        <Track />
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
