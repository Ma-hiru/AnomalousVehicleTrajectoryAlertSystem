import { ChangeEvent, FC, memo, useContext } from "react";
import { Input } from "antd";
import { NumberOutlined } from "@ant-design/icons";
import { SettingsCtx } from "@/components/Settings/ctx.ts";
import { createStyleSheet } from "@/utils/createStyleSheet.ts";
import { debounce } from "lodash-es";

interface props {
  data: any;
}

const ItemsContent: FC<props> = ({ data }) => {
  const { updater, currentItem, currentTabs } = useContext(SettingsCtx);
  const isArray = typeof data === "object";
  const setConfig = ({ target: { value } }: ChangeEvent<HTMLInputElement>, index?: number) => {
    updater((draft) => {
      if (isArray) {
        (draft.data[currentTabs][currentItem] as string[])[index!] = value;
      } else {
        draft.data[currentTabs][currentItem] = value;
      }
    });
  };
  const newUpdater = debounce(setConfig, 500);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-expect-error
  const delLine = (index: number) => {
    updater((draft) => {
      if (isArray) {
        if ((draft.data[currentTabs][currentItem] as string[]).length === 1) {
          (draft.data[currentTabs][currentItem] as string[])[0] = "";
        } else
          (draft.data[currentTabs][currentItem] as string[]).splice(index, 1);
      }
    });
  };
  return (
    <>
      {
        isArray ?
          data.map((item: string, index: number) => {
            return (
              <div className="flex justify-center items-center" key={index} style={styles.ItemBox}>
                <span><NumberOutlined /></span>
                <Input defaultValue={item} variant="underlined"
                       onChange={(e) => newUpdater(e, index)}
                />
              </div>
            );
          }) :
          <div className="flex justify-center items-center" style={styles.ItemBox}>
            <span><NumberOutlined /></span>
            <Input defaultValue={data} variant="underlined" onChange={newUpdater} />
          </div>
      }
    </>
  );
};
export default memo(ItemsContent);

const styles = createStyleSheet({
  ItemBox: {
    fontSize: "1rem",
    height: "1rem",
    lineHeight: "1rem",
    marginBottom: "1.5rem"
  }
});
