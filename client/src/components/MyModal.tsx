import { FC, memo, ReactNode, useMemo } from "react";
import { Modal, ConfigProvider } from "antd";
import { createAntdTheme } from "@/utils/createAntdTheme";
import { CloseCircleOutlined } from "@ant-design/icons";

type props = {
  open: boolean;
  title: string;
  onCancel: () => void;
  children?: ReactNode;
  width?: string | number | "unset";
};

const MyModal: FC<props> = ({ open, title, onCancel, children, width = "auto" }) => {
  const closeIcon = useMemo(() => <CloseCircleOutlined style={{ color: "#ffffff" }} />, []);
  return (
    <>
      <ConfigProvider theme={themes.MyModal}>
        <Modal
          open={open}
          title={title}
          onCancel={onCancel}
          width={width === "unset" ? undefined : width}
          footer={null}
          children={children}
          closeIcon={closeIcon}
        />
      </ConfigProvider>
    </>
  );
};
export default memo(MyModal);

const themes = createAntdTheme({
  MyModal: {
    Modal: {
      contentBg: "var(--antd-modal-content-bg)",
      headerBg: "var(--antd-modal-header-bg)",
      titleColor: "var(--antd-modal-title-color)",
      footerBg: "var(--antd-modal-footer-bg)"
    }
  },
  CancelBtn: {
    Button: {
      textTextColor: "var(--antd-modal-cancel-textColor)"
    }
  },
  ConfirmBtn: {
    Button: {
      defaultBg: "var(--antd-modal-Confirm-defaultBg)",
      defaultColor: "var(--antd-modal-Confirm-defaultColor)",
      defaultActiveBg: "var(--antd-modal-Confirm-defaultActiveBg)",
      defaultActiveColor: "var(--antd-modal-Confirm-defaultActiveColor)",
      defaultHoverBg: "var(--antd-modal-Confirm-defaultHoverBg)",
      defaultHoverColor: "var(--antd-modal-Confirm-defaultHoverColor)"
    }
  }
} as const);
