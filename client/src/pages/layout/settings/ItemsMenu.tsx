import { FC, Dispatch, SetStateAction, memo } from "react";
import { ConfigProvider, Segmented } from "antd";

interface props {
  name: string[];
  setCurrentItem: Dispatch<SetStateAction<string>>;
  currentItem: string;
  className?: string;
}

const ItemsMenu: FC<props> = ({ name, currentItem, setCurrentItem, className }) => {
  const renderItem = () =>
    name.map(item =>
      ({ label: item, value: item })
    );
  const delLine = () => {
  };
  const newLine = () => {
  };
  return (
    <>
      <div style={{ overflowY: "scroll", scrollbarWidth: "none" }} className={className}>
        <ConfigProvider theme={{
          components: {
            Segmented: {
              trackBg: "var(--settings-segmented-trackBg)",
              trackPadding: "var(--settings-segmented-trackPadding)",
              itemSelectedBg: "var(--settings-segmented-selectedBg)",
              itemSelectedColor: "var(--settings-segmented-selectedColor)",
              itemColor: "var(--settings-segmented-Color)"
            }
          }
        }}>
          <Segmented
            vertical
            defaultValue={currentItem}
            options={renderItem()}
            onChange={value => setCurrentItem(value)}
          />
        </ConfigProvider>
      </div>
    </>
  );
};
export default memo(ItemsMenu);
