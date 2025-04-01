import { FC, memo, useContext, useState } from "react";
import ItemsMenu from "@/pages/layout/settings/ItemsMenu.tsx";
import ItemsContent from "@/pages/layout/settings/ItemsContent.tsx";
import { createStyleSheet } from "@/utils/createStyleSheet.ts";
import { SettingsCtx } from "@/pages/layout/settings/ctx.ts";

interface props {
  data: any;
}

const Content: FC<props> = ({ data }) => {
  const itemsMenu = Object.keys(data);
  const [currentItem, setCurrentItem] = useState(itemsMenu[0]);
  const ctxData = useContext(SettingsCtx);
  return (
    <>
      <div className="grid grid-rows-1 grid-cols-[auto_1fr] h-full w-full">
        <ItemsMenu
          name={itemsMenu}
          setCurrentItem={setCurrentItem}
          currentItem={currentItem}
        />
        <div style={styles.ItemsContent}>
          <SettingsCtx.Provider value={{
            ...ctxData,
            currentItem
          }}>
            <ItemsContent data={data[currentItem]} key={currentItem} />
          </SettingsCtx.Provider>
        </div>
      </div>
    </>
  );
};
export default memo(Content);

const styles = createStyleSheet({
  ItemsContent: {
    padding: "var(--settings-content-padding)",
    width: "100%",
    height: "100%"
  }
});
