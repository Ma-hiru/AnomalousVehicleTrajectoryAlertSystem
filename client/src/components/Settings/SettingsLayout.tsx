import { FC, useEffect, memo } from "react";
import { Button } from "antd";
import { createStyleSheet } from "@/utils/createStyleSheet.ts";
import { JsonToYaml } from "@/utils/handleYaml.ts";
import { useMyState } from "@/hooks/useMyState.ts";
import Loading from "@/components/Settings/Loading.tsx";
import { useFetchDataReact } from "@/hooks/useFetchData.ts";
import Logger from "@/utils/logger.ts";
import Menu from "@/components/Settings/Menu.tsx";
import Content from "@/components/Settings/Content.tsx";

interface props {
  refresh: () => void;
}


const Config: FC<props> = ({ refresh }) => {
  const config = useMyState<Go2rtcConfigYaml | undefined>(undefined);
  const loading = useMyState({
    loading: false,
    result: false
  });
  const { fetchData, API } = useFetchDataReact();
  useEffect(() => {
    let isMounted = true;
    loading.set(draft => {
      draft.loading = true;
    });
    fetchData(
      API.reqGetGo2rtcConfig,
      [],
      (res) => {
        if (isMounted) {
          config.set(res.data!);
          loading.set(draft => {
            draft.result = true;
          });
        }
      },
      (res) => {
        if (isMounted) {
          loading.set(draft => {
            draft.result = false;
          });
          Logger.Message.Error(res.message);
        }
      }
    ).finally(() => {
      loading.set(draft => {
        draft.loading = false;
      });
    });
    return () => {
      isMounted = false;
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API.reqGetGo2rtcConfig, fetchData]);
  const saveConfig = async () => {
    const currentConfig = config.get();
    if (currentConfig && currentConfig.data) {
      try {
        const yaml = JsonToYaml(currentConfig.data);
        Logger.Echo({ yaml });
        await fetchData(API.reqPatchGo2rtcConfig, [yaml]);
        refresh();
      } catch (err) {
        //jsonToYaml error
        Logger.Echo({ err });
        Logger.Message.Error("保存失败！");
      }
    }
  };
  const currentContent = useMyState<string | string[]>("");
  const currentIndex = useMyState<string[]>([]);
  useEffect(() => {
    const currentConfig = config.get();
    if (currentIndex.get().length > 0 && currentConfig && currentConfig.data) {
      currentContent.set(currentConfig.data[currentIndex.get()[0]][currentIndex.get()[1]]);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, currentIndex]);
  return (
    <>
      <div className="grid grid-cols-1 grid-rows-[minmax(0,1fr)_auto]  w-full min-h-[75vh]">
        {
          config.get() && (
            <>
              <div
                className="grid grid-rows-1 grid-cols-[var(--settings-divider-ratio)] h-full w-full">
                <Menu
                  config={config}
                  currentContent={currentContent}
                  currentIndex={currentIndex}
                />
                {/*内容*/}
                <div className="pl-[--layout-card-inset-padding] pr-[--layout-card-inset-padding]">
                  <Content
                    currentContent={currentContent.get()}
                    currentIndex={currentIndex.get()}
                    config={config}
                  />
                </div>
              </div>
              {/*底部按钮*/}
              <div className="w-full flex flex-row justify-end items-center">
                <Button variant="link" color="blue" onClick={refresh}>
                  刷新
                </Button>
                <Button variant="solid" color="blue" style={styles.saveBtn} onClick={saveConfig}>
                  保存
                </Button>
              </div>
            </>
          )
        }
        {
          !config.get() &&
          <Loading loading={loading.get().loading} result={loading.get().result} />
        }
      </div>
    </>
  );
};
export default memo(Config);

const styles = createStyleSheet({
  saveBtn: {
    marginLeft: "1rem"
  }
});
