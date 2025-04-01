import { FC, memo, useEffect, useState } from "react";
import {
  AlertOutlined,
  RadarChartOutlined,
  SettingOutlined
} from "@ant-design/icons";
import { Menu, ConfigProvider, type MenuProps } from "antd";


interface props {
  currentRoute: string;
  setRoute: (path: string) => void;
}


type MenuItem = Required<MenuProps>["items"][number];
const items: MenuItem[] = [
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
];

export const TabsMenu: FC<props> = ({ currentRoute, setRoute }) => {
  const [current, setCurrent] = useState(currentRoute);
  useEffect(() => {
    setRoute(current);
  }, [current, setRoute]);
  return (
    <>
      <ConfigProvider theme={{
        components: {
          Menu: {
            colorBgContainer: "var(--layout-bar-bg)",
            colorText: "var(--layout-bar-color)",
            horizontalLineHeight: "var(--layout-bar-height)",
            horizontalItemSelectedColor: "var(--layout-bar-menu-active-color)"
          }
        }
      }}>
        <Menu onClick={({ key }) => setCurrent(key)}
              selectedKeys={[current]}
              mode="horizontal"
              items={items}
              className="select-none"
        />
      </ConfigProvider>
    </>
  );
};
export default memo(TabsMenu);
