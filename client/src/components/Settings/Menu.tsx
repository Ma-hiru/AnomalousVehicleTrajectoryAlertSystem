import { FC, useCallback, useState } from "react";
import "./Menu.scss";
import AddMenu from "@/components/Settings/AddMenu";
import { Updater, useImmer } from "use-immer";
import MenuTree from "@/components/Settings/MenuTree";

const Menu: FC<props> = ({
  config,
  setConfig,
  setCurrentContent,
  setCurrentIndex,
  currentIndex
}) => {
  const [modalShow, setModalShow] = useImmer(false);
  const [update, setUpdate] = useState(0);
  const removeItem = useCallback(
    (level1: string, level2: string) => {
      setConfig((draft) => {
        if (draft && draft.data) {
          delete draft.data[level1][level2];
        }
      });
    },
    [setConfig]
  );
  const updateMenuTree = useCallback(() => {
    setUpdate((d) => d + 1);
  }, []);
  // noinspection com.intellij.reactbuddy.ArrayToJSXMapInspection
  return (
    <>
      <div className="settings-menu-container">
        <ul className="menu menu-xs bg-transparent rounded-lg  max-w-xs w-full min-w-36">
          <MenuTree
            key={update}
            config={config}
            setCurrentContent={setCurrentContent}
            setCurrentIndex={setCurrentIndex}
            setModalShow={setModalShow}
            removeItem={removeItem}
            currentIndex={currentIndex}
          />
        </ul>
      </div>
      <AddMenu
        open={modalShow}
        change={setModalShow}
        config={config}
        setConfig={setConfig}
        update={updateMenuTree}
      />
    </>
  );
};
export default Menu;

type props = {
  config: Go2rtcConfigYaml | undefined;
  setConfig: Updater<Go2rtcConfigYaml | undefined>;
  currentContent: string | string[];
  setCurrentContent: Updater<string | string[]>;
  currentIndex: [level1: string, level2: string];
  setCurrentIndex: Updater<[level1: string, level2: string]>;
};
