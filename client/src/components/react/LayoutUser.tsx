import { FC, memo } from "react";
import { Avatar, Button } from "antd";
import {
  FullscreenExitOutlined,
  LogoutOutlined,
  ReloadOutlined,
  SunOutlined
} from "@ant-design/icons";
import "./LayoutUser.scss";
import { createStyleSheet } from "@/utils/createStyleSheet.ts";

interface props {
  /* empty */
}

const LayoutUser: FC<props> = () => {
  return (
    <>
      <div className="flex items-center layout-user-container"
           style={{ height: "var(--layout-bar-height)" }}>
        <Button type="text"
                shape="circle"
                icon={<ReloadOutlined style={styles.iconColor} />}
        />
        <Button type="text"
                shape="circle"
                icon={<FullscreenExitOutlined style={styles.iconColor} />}
        />
        <Button type="text"
                shape="circle"
                icon={<SunOutlined style={styles.iconColor} />}
        />
        <Button type="text"
                shape="circle"
                icon={<LogoutOutlined style={styles.iconColor} />}
        />
        <Avatar />
      </div>
    </>
  );
};
export default memo(LayoutUser);
const styles = createStyleSheet({
  iconColor: {
    color: "var(--layout-bar-color)"
  }
});
