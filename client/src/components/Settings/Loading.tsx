import { FC, useMemo } from "react";
import { Space } from "antd";
import { LoadingOutlined, StopOutlined } from "@ant-design/icons";
import { createStyleSheet } from "@/utils/createStyleSheet";

type props = {
  loading: boolean;
  result: boolean;
};

const Loading: FC<props> = ({ loading, result }) => {
  const render = useMemo(() => {
    if (loading) {
      return <LoadingOutlined style={styles.loadingIcon} />;
    } else {
      if (!result) {
        return (
          <Space>
            <Space.Compact>
              <StopOutlined style={{ color: "red" }} />
            </Space.Compact>
            <Space.Compact>
              <span className={"text-white"}>请检查网络！</span>;
            </Space.Compact>
          </Space>
        );
      }
    }
  }, [loading, result]);
  return (
    <>
      <div className="flex justify-center items-center w-full h-full">{render}</div>
    </>
  );
};
export default Loading;
const styles = createStyleSheet({
  loadingIcon: {
    fontSize: "2rem",
    color: "var(--settings-loadingIcon-color)"
  }
});
