import { FC, useCallback, useEffect, useMemo, useState } from "react";
import {
  Table,
  Timeline,
  Card,
  Descriptions,
  Badge,
  Tabs,
  Tag,
  ConfigProvider,
  theme,
  Space,
  Tooltip
} from "antd";
import { useStreamStore } from "@/stores/pinia";
import { pinia } from "@/stores/pinia";
import {
  ClockCircleOutlined,
  EyeOutlined,
  AlertOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import { useMemoizedFn } from "ahooks";
import "./Detail.scss";

interface props {
  track: Track[];
}

const Detail: FC<props> = ({ track }) => {
  const GetKey = useCallback((track: Track, salt: number) => {
    return `${track.streamId}-${track.timeRange[0]}-${salt}`;
  }, []);
  const [activeTabKey, setActiveTabKey] = useState<string>("");

  const sortedTrack = useMemo(
    () => [...track].sort((a, b) => a.timeRange[0] - b.timeRange[0]),
    [track]
  );
  const streamStore = useStreamStore(pinia);
  const getStreamName = useCallback(
    (streamId: number) => {
      const stream = streamStore.StreamList.find((s) => s.streamId === streamId);
      return stream ? stream.streamName : `视频流 ${streamId}`;
    },
    [streamStore.StreamList]
  );
  const sortRecordsByTime = useMemoizedFn((records: (records | CarRecord)[]) => {
    if (!Array.isArray(records)) return [];
    return [...records].sort((a, b) => a.time - b.time);
  });
  const formatTime = useMemoizedFn((timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString("zh-CN", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    } else {
      return date.toLocaleString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
    }
  });
  const getStatus = useCallback(
    (record: records | CarRecord) => {
      if ("status" in record) return record.status;
      const actionName = streamStore.ActionsEnum[record.actionId] || "";
      return actionName.includes("正常") || actionName.toLowerCase().includes("normal");
    },
    [streamStore.ActionsEnum]
  );
  const tabItems = useMemo(() => {
    try {
      return sortedTrack.map((t, index) => {
        const streamName = getStreamName(t.streamId);
        return {
          key: GetKey(t, index),
          label: (
            <Space>
              <EyeOutlined />
              {streamName}
            </Space>
          ),
          children: (
            <>
              <Descriptions title="轨迹段信息" bordered size="small" column={2}>
                <Descriptions.Item label="视频ID" span={1}>
                  <Space>
                    <EyeOutlined style={{ color: "var(--settings-loadingIcon-color)" }} />
                    {t.streamId}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="视频名称" span={1}>
                  {streamName}
                </Descriptions.Item>
                <Descriptions.Item label="首次出现" span={1}>
                  <Space>
                    <ClockCircleOutlined style={{ color: "#52c41a" }} />
                    <Tooltip title={new Date(t.timeRange[0]).toLocaleString()}>
                      {formatTime(t.timeRange[0])}
                    </Tooltip>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="最后出现" span={1}>
                  <Space>
                    <ClockCircleOutlined style={{ color: "#fa541c" }} />
                    <Tooltip title={new Date(t.timeRange[1]).toLocaleString()}>
                      {formatTime(t.timeRange[1])}
                    </Tooltip>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="记录数量" span={2}>
                  <Badge
                    count={t.records.length}
                    style={{ backgroundColor: "var(--settings-loadingIcon-color)" }}
                  />
                </Descriptions.Item>
              </Descriptions>
              <div style={{ marginTop: "20px" }}>
                <h3>
                  <Space>
                    <AlertOutlined style={{ color: "#fa541c" }} />
                    车辆行为记录
                  </Space>
                </h3>
                <Table
                  dataSource={sortRecordsByTime(t.records).map((r, i) => ({
                    ...r,
                    key: `${r.recordId || i}`,
                    // 使用正确的状态获取方法
                    status: getStatus(r)
                  }))}
                  pagination={{ pageSize: 8, showSizeChanger: false, showQuickJumper: true }}
                  size="small"
                  bordered>
                  <Table.Column
                    title="时间"
                    dataIndex="time"
                    key="time"
                    width={120}
                    render={(time) => (
                      <Tooltip title={new Date(time).toLocaleString()}>
                        <span style={{ fontSize: "12px" }}>{formatTime(time)}</span>
                      </Tooltip>
                    )}
                  />
                  <Table.Column
                    title="行为"
                    dataIndex="actionId"
                    key="actionId"
                    width={100}
                    render={(actionId) => {
                      const actionName = streamStore.ActionsEnum[actionId] || "未知行为";
                      const isNormal =
                        actionName.includes("正常") || actionName.toLowerCase().includes("normal");
                      return (
                        <Tag
                          color={isNormal ? "success" : "error"}
                          icon={isNormal ? <CheckCircleOutlined /> : <AlertOutlined />}>
                          {actionName}
                        </Tag>
                      );
                    }}
                  />
                  <Table.Column
                    title="状态"
                    dataIndex="status"
                    key="status"
                    width={80}
                    align="center"
                    render={(status) => (
                      <Badge
                        status={status ? "success" : "error"}
                        text={status ? "正常" : "异常"}
                        style={{ color: status ? "#52c41a" : "#fa541c" }}
                      />
                    )}
                  />
                </Table>
              </div>
            </>
          )
        };
      });
    } catch (e) {
      console.error("Error generating tab items:", e);
      return null;
    }
  }, [
    GetKey,
    formatTime,
    getStatus,
    getStreamName,
    sortRecordsByTime,
    sortedTrack,
    streamStore.ActionsEnum
  ]);
  useEffect(() => {
    setActiveTabKey(GetKey(sortedTrack[0], 0));
  }, [GetKey, sortedTrack]);
  return (
    <ConfigProvider theme={AntdTheme}>
      <div className="track-details-container">
        <div className="track-summary">
          <Card
            style={{ color: "white" }}
            title={
              <Space>
                <ClockCircleOutlined style={{ color: "var(--settings-loadingIcon-color)" }} />
                轨迹概览 (时间顺序)
              </Space>
            }
            variant={"borderless"}
            size="small">
            <Timeline
              mode="left"
              items={sortedTrack.map((t, index) => ({
                label: (
                  <div style={{ width: "140px", textAlign: "right" }}>
                    <Tooltip title={new Date(t.timeRange[0]).toLocaleString()}>
                      <div
                        style={{ fontSize: "12px", color: "var(--settings-menu-default-color)" }}>
                        {formatTime(t.timeRange[0])}
                      </div>
                    </Tooltip>
                  </div>
                ),
                children: (
                  <div style={{ paddingLeft: "8px" }}>
                    <h4
                      style={{ margin: "0 0 8px 0", color: "var(--settings-content-text-color)" }}>
                      <Space>
                        <EyeOutlined />
                        {getStreamName(t.streamId)}
                      </Space>
                    </h4>
                    <div style={{ fontSize: "12px", color: "var(--settings-menu-default-color)" }}>
                      <Space direction="vertical" size={2}>
                        <div>
                          <ClockCircleOutlined style={{ marginRight: "4px" }} />
                          持续时长: {Math.round((t.timeRange[1] - t.timeRange[0]) / 1000)}秒
                        </div>
                        <div>
                          <AlertOutlined style={{ marginRight: "4px", color: "#fa541c" }} />
                          记录数: {t.records.length}
                        </div>
                      </Space>
                    </div>
                  </div>
                ),
                color:
                  index === 0
                    ? "var(--settings-loadingIcon-color)"
                    : index === sortedTrack.length - 1
                      ? "#fa541c"
                      : "#52c41a"
              }))}
            />
          </Card>
        </div>
        <div className="track-details">
          {tabItems && (
            <Tabs
              activeKey={activeTabKey}
              onChange={setActiveTabKey}
              type="card"
              items={tabItems}
            />
          )}
        </div>
      </div>
    </ConfigProvider>
  );
};

export default Detail;

const AntdTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "var(--settings-loadingIcon-color)", // 使用全局统一的主色调
    colorBgContainer: "var(--antd-modal-content-bg)",
    colorText: "var(--settings-content-text-color)",
    colorBgElevated: "var(--antd-modal-content-bg)",
    colorBorder: "var(--settings-content-content-divider)",
    colorBorderSecondary: "var(--settings-content-content-divider)",
    borderRadius: 6,
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)"
  },
  components: {
    Card: {
      colorBorderSecondary: "var(--settings-content-content-divider)",
      headerBg: "var(--antd-modal-header-bg)",
      colorBgContainer: "transparent",
      paddingLG: 16
    },
    Tabs: {
      colorBorderSecondary: "var(--settings-content-content-divider)",
      cardBg: "var(--settings-menu-default-bg)",
      itemHoverColor: "var(--settings-menu-active-color)",
      itemActiveColor: "var(--settings-menu-actived-color)",
      itemSelectedColor: "var(--settings-menu-actived-color)",
      cardHeight: 42,
      horizontalMargin: "0 2px 0 0"
    },
    Descriptions: {
      colorTextHeading: "var(--settings-content-text-color)",
      colorBgContainer: "transparent",
      colorSplit: "var(--settings-content-title-divider)",
      labelBg: "var(--antd-modal-header-bg)",
      contentBg: "var(--antd-modal-content-bg)",
      colorText: "var(--settings-content-text-color)"
    },
    Table: {
      headerBg: "var(--antd-modal-header-bg)",
      rowHoverBg: "var(--settings-menu-active-bg)",
      headerSplitColor: "var(--settings-content-content-divider)",
      headerColor: "var(--antd-modal-title-color)",
      cellPaddingBlock: 10,
      colorBgContainer: "transparent",
      colorText: "var(--settings-content-text-color)",
      rowSelectedBg: "var(--settings-menu-active-bg)",
      colorFillAlter: "rgba(255,255,255,0.02)",
      bodySortBg: "rgba(255,255,255,0.01)"
    },
    Timeline: {
      tailColor: "var(--settings-content-content-divider)",
      dotBorderWidth: 2,
      tailWidth: 1
    },
    Badge: {
      statusSize: 6,
      textFontSize: 12,
      textFontSizeSM: 12
    },
    Tag: {
      colorBgContainer: "rgba(255, 255, 255, 0.08)",
      colorBorder: "rgba(255, 255, 255, 0.15)",
      borderRadiusSM: 4,
      fontSizeSM: 12
    },
    Tooltip: {
      colorBgSpotlight: "rgba(0, 0, 0, 0.8)",
      colorTextLightSolid: "#fff"
    },
    Pagination: {
      itemBg: "var(--settings-menu-default-bg)",
      itemActiveBg: "var(--settings-loadingIcon-color)",
      borderRadius: 4
    }
  }
};
