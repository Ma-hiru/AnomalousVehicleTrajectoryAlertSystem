import { FC, useEffect, memo, useCallback, useState, useLayoutEffect } from "react";
import { Button } from "antd";
import { createStyleSheet } from "@/utils/createStyleSheet";
import { JsonToYaml } from "@/utils/handleYaml";
import Loading from "@/components/Settings/Loading";
import Logger from "@/utils/logger";
import Menu from "@/components/Settings/Menu";
import Content from "@/components/Settings/Content";
import { useReactive } from "ahooks";
import { fetchDataAsync } from "@/utils/fetchData";
import styled from "styled-components";
import { useImmer } from "use-immer";
import { useSettingsZustandStore } from "@/stores/zustand/settings";
import { useShallow } from "zustand/react/shallow";
import AppSettings from "@/settings";
import { useMapZustandStore } from "@/stores/zustand/map";

const Settings: FC<object> = () => {
  const status = useReactive({
    loading: false,
    result: false
  });
  const [refreshId, setRefreshId] = useState(0);
  const [config, setConfig] = useImmer<Go2rtcConfigYaml | undefined>(undefined);
  const [currentContent, setCurrentContent] = useImmer<string | string[]>("");
  const [currentIndex, setCurrentIndex] = useImmer<[level1: string, level2: string]>(["", ""]);
  const { clearModifiedVideos, addModifiedVideos, modifiedVideos } = useSettingsZustandStore(
    useShallow((state) => ({
      clearModifiedVideos: state.clearModifiedVideos,
      addModifiedVideos: state.addModifiedVideos,
      modifiedVideos: state.modifiedVideos
    }))
  );
  const { videoList } = useMapZustandStore(useShallow((state) => ({ videoList: state.videoList })));
  const getPosition = useCallback(
    (streamName: string) => {
      const info = videoList.find((item) => item.streamName === streamName);
      return {
        longitude: info?.longitude || 0,
        latitude: info?.latitude || 0
      };
    },
    [videoList]
  );
  useEffect(() => {
    status.loading = true;
    fetchDataAsync("reqGetGo2rtcConfig")
      .then(({ ok, data, message }) => {
        if (ok) {
          data && setConfig(data);
          clearModifiedVideos();
          const config = data?.data;
          if (config && config[AppSettings.STREAMS_CONF_NAME]) {
            Object.keys(config[AppSettings.STREAMS_CONF_NAME]).forEach((streamName) => {
              addModifiedVideos(streamName, getPosition(streamName));
            });
          }
          status.result = true;
        } else {
          status.result = false;
          Logger.Message.Error(message);
        }
      })
      .catch(Logger.Message.Error)
      .finally(() => {
        status.loading = false;
      });
    //add refreshId
  }, [addModifiedVideos, clearModifiedVideos, getPosition, setConfig, status, refreshId]);
  useLayoutEffect(() => {
    if (currentIndex[0] !== "" && currentIndex[1] !== "" && config && config.data) {
      setCurrentContent(config.data[currentIndex[0]][currentIndex[1]]);
    }
  }, [config, currentIndex, setCurrentContent]);
  const refresh = useCallback(() => {
    setRefreshId((id) => id + 1);
  }, []);
  const saveStream = useCallback(async () => {
    const newStream: {
      streamName: string;
      latitude: number;
      longitude: number;
    }[] = [];
    modifiedVideos.forEach((position, streamName) => {
      newStream.push({
        streamName,
        ...position
      });
    });
    const { ok } = await fetchDataAsync("req_videos_settings", [newStream]);
    return ok;
  }, [modifiedVideos]);
  const saveConfig = useCallback(async () => {
    if (config && config.data) {
      try {
        const yaml = JsonToYaml(config.data);
        await fetchDataAsync("req_update_go2rtc_yaml", [yaml]);
        const ok = await saveStream();
        if (ok) {
          Logger.Message.Success("保存成功！");
          refresh();
        } else {
          Logger.Message.Success("请设置经纬度");
        }
      } catch (err) {
        Logger.Echo({ err });
        Logger.Message.Error("保存失败！");
      }
    }
  }, [config, refresh, saveStream]);

  return (
    <>
      <Container key={refreshId}>
        {config && (
          <>
            <ContentBody>
              <Menu
                config={config}
                setConfig={setConfig}
                currentContent={currentContent}
                setCurrentContent={setCurrentContent}
                currentIndex={currentIndex}
                setCurrentIndex={setCurrentIndex}
              />
              <ContentBox>
                <Content
                  currentContent={currentContent}
                  currentIndex={currentIndex}
                  setConfig={setConfig}
                />
              </ContentBox>
            </ContentBody>
            <ContentBottom>
              <Button variant="link" color="blue" onClick={refresh}>
                刷新
              </Button>
              <Button variant="solid" color="blue" style={styles.saveBtn} onClick={saveConfig}>
                保存
              </Button>
            </ContentBottom>
          </>
        )}
        {!config && <Loading loading={status.loading} result={status.result} />}
      </Container>
    </>
  );
};
export default memo(Settings);

const styles = createStyleSheet({
  saveBtn: {
    marginLeft: "1rem"
  }
});

const Container = styled.div`
  width: 100%;
  min-height: 75vh;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: minmax(0, 1fr) auto;
`;

const ContentBottom = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: end;
  align-items: center;
`;

const ContentBody = styled.div`
  display: grid;
  grid-template-columns: var(--settings-divider-ratio);
  height: 100%;
  width: 100%;
  grid-template-rows: 1fr;
`;

const ContentBox = styled.div`
  padding-left: var(--settings-content-inset-padding);
  padding-right: var(--settings-content-inset-padding);
`;
