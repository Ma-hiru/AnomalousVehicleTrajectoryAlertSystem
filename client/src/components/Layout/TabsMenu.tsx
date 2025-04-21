import { FC, memo, useEffect } from "react";
import {
  AlertOutlined,
  RadarChartOutlined,
  SettingOutlined
} from "@ant-design/icons";
import { Menu, ConfigProvider, type MenuProps } from "antd";
import { createAntdTheme } from "@/utils/createAntdTheme.ts";
import { useMyState } from "@/hooks/useMyState.ts";


interface props {
  currentRoute: string;
  setRoute: (path: string) => void;
}


type MenuItem = Required<MenuProps>["items"][number];
const items = [
  {
    label: "实时数据",
    key: "/analysis",
    icon: <RadarChartOutlined />
  },
  {
    label: "轨迹追踪",
    key: "/track",
    icon: <AlertOutlined />
  },
  {
    label: "设置",
    key: "/settings",
    icon: <SettingOutlined />
  }
]satisfies MenuItem[];

export const TabsMenu: FC<props> = ({ currentRoute, setRoute }) => {
  const current = useMyState(currentRoute);
  useEffect(() => {
    setRoute(current.get());
  }, [current, setRoute]);
  return (
    <>
      <ConfigProvider theme={styles.TabsMenu}>
        <Menu
          onClick={({ key }) => current.set(key)}
          selectedKeys={[current.get()]}
          mode="horizontal"
          items={items}
          className="select-none"
        />
      </ConfigProvider>
    </>
  );
};
export default memo(TabsMenu);
const styles = createAntdTheme({
  TabsMenu: {
    Menu: {
      colorBgContainer: "var(--layout-bar-bg)",
      colorText: "var(--layout-bar-color)",
      horizontalLineHeight: "var(--layout-bar-height)",
      horizontalItemSelectedColor: "var(--layout-bar-menu-active-color)"
    }
  }
});
