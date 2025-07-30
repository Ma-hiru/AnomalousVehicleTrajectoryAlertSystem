import { FC, useMemo } from "react";
import { LoadingOutlined } from "@ant-design/icons";
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
        //TODO 添加空状态
        return <span>加载失败！请检查网络或者重新登录</span>;
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
