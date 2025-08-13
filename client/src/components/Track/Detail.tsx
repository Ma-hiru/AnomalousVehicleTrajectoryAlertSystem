import { FC, memo, useState } from "react";
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
import styled from "styled-components";
import { useStreamStore } from "@/stores/pinia";
import { pinia } from "@/stores/pinia";
import {
  ClockCircleOutlined,
  EyeOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  WarningOutlined
} from "@ant-design/icons";

interface props {
  track: Track[];
}

const Detail: FC<props> = ({ track }) => {
  // 确保传入的track是有效的数组
  const validTrack = Array.isArray(track) ? track : [];

  // 修复：为每个轨迹段生成唯一key，避免重复streamId问题
  const [activeTabKey, setActiveTabKey] = useState<string>(
    validTrack.length > 0 ? `${validTrack[0].streamId}-${validTrack[0].timeRange[0]}` : "0"
  );
  const streamStore = useStreamStore(pinia);

  // 获取视频流名称
  const getStreamName = (streamId: number) => {
    const stream = streamStore.StreamList.find((s) => s.streamId === streamId);
    return stream ? stream.streamName : `视频流 ${streamId}`;
  };

  // 根据时间排序记录 - 使用CarRecord类型，包含status字段
  const sortRecordsByTime = (records: (records | CarRecord)[]) => {
    if (!Array.isArray(records)) return [];
    return [...records].sort((a, b) => a.time - b.time);
  };

  // 格式化时间显示 - 缩短时间格式避免挡住界面
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      // 今天只显示时间
      return date.toLocaleTimeString("zh-CN", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    } else {
      // 其他日期显示日期和时间
      return date.toLocaleString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
    }
  };

  // 检查记录是否包含status字段
  const hasStatusField = (record: records | CarRecord): record is CarRecord => {
    return "status" in record;
  };

  // 根据记录获取状态
  const getStatus = (record: records | CarRecord): boolean => {
    if (hasStatusField(record)) {
      return record.status;
    }
    // 如果没有status字段，根据actionId判断
    return getRecordStatus(record.actionId);
  };

  // 根据actionId判断是否为正常状态
  const getRecordStatus = (actionId: number): boolean => {
    const actionName = streamStore.ActionsEnum[actionId] || "";
    // 如果是正常行为（actionId为0或行为名包含"正常"），返回true
    return (
      actionId === 0 || actionName.includes("正常") || actionName.toLowerCase().includes("normal")
    );
  };

  // 按照时间顺序排序轨迹
  const sortedTrack = [...validTrack].sort((a, b) => a.timeRange[0] - b.timeRange[0]);

  // 如果没有数据，显示提示信息
  if (validTrack.length === 0) {
    return (
      <ConfigProvider theme={AntdTheme}>
        <DetailContainer>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "200px",
              color: "var(--settings-menu-default-color)"
            }}>
            <Space direction="vertical" align="center">
              <WarningOutlined style={{ fontSize: "48px", color: "#fa541c" }} />
              <h3>暂无轨迹数据</h3>
            </Space>
          </div>
        </DetailContainer>
      </ConfigProvider>
    );
  }

  // 修复：为Tabs生成正确的数据结构，使用唯一key
  const tabItems = sortedTrack.map((t) => {
    const streamName = getStreamName(t.streamId);
    const uniqueKey = `${t.streamId}-${t.timeRange[0]}`;

    return {
      key: uniqueKey,
      label: (
        <Space>
          <EyeOutlined />
          {streamName}
        </Space>
      ),
      children: (
        <div>
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
                  const isNormal = getRecordStatus(actionId);
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
        </div>
      )
    };
  });

  return (
    <ConfigProvider theme={AntdTheme}>
      <DetailContainer>
        <div className="track-summary">
          <Card
            title={
              <Space>
                <ClockCircleOutlined style={{ color: "var(--settings-loadingIcon-color)" }} />
                轨迹概览 (时间顺序)
              </Space>
            }
            bordered={false}
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
          <Tabs activeKey={activeTabKey} onChange={setActiveTabKey} type="card" items={tabItems} />
        </div>
      </DetailContainer>
    </ConfigProvider>
  );
};

export default memo(Detail);

const DetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 70vh;
  overflow-y: auto;
  color: var(--settings-content-text-color);
  background: var(--antd-modal-content-bg);
  border: 1px solid var(--settings-content-content-divider);
  border-radius: 8px;
  padding: var(--settings-content-inset-padding);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

  /* 滚动条样式优化 */

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--settings-content-content-divider);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--settings-loadingIcon-color);
    border-radius: 3px;
    opacity: 0.6;
    transition: all 0.3s ease;
  }

  &::-webkit-scrollbar-thumb:hover {
    opacity: 0.8;
  }

  .track-summary {
    margin-bottom: 20px;

    .ant-card {
      background: var(--antd-modal-header-bg);
      backdrop-filter: blur(10px);
      border: 1px solid var(--settings-content-content-divider);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .ant-card-head {
      border-bottom: 1px solid var(--settings-content-title-divider);

      .ant-card-head-title {
        color: var(--antd-modal-title-color);
      }
    }
  }

  .track-details {
    flex: 1;

    .ant-tabs {
      .ant-tabs-nav {
        margin-bottom: 16px;
      }

      .ant-tabs-tab {
        background: var(--settings-menu-default-bg);
        color: var(--settings-menu-default-color);
        border: 1px solid var(--settings-content-content-divider);
        border-radius: 6px 6px 0 0;
        margin-right: 2px;
        transition: all 0.3s ease;

        &:hover {
          background: var(--settings-menu-active-bg);
          color: var(--settings-menu-active-color);
        }

        &.ant-tabs-tab-active {
          background: var(--settings-menu-actived-bg);
          color: var(--settings-menu-actived-color);
          border-color: var(--settings-loadingIcon-color);
        }
      }

      .ant-tabs-content-holder {
        background: var(--antd-modal-header-bg);
        border-radius: 8px;
        padding: var(--settings-content-inset-padding);
        border: 1px solid var(--settings-content-content-divider);
      }
    }
  }

  h3,
  h4 {
    color: var(--settings-content-text-color);
    margin-bottom: 12px;
    font-weight: 500;
  }

  p {
    color: var(--settings-menu-default-color);
    margin-bottom: 8px;
  }

  .ant-timeline-item-label {
    width: 140px !important;
    color: var(--settings-menu-default-color);
    font-size: 12px;
  }

  .ant-timeline-item-content {
    left: 160px !important;
  }

  .ant-descriptions-bordered .ant-descriptions-item-label {
    background-color: var(--antd-modal-header-bg);
    color: var(--settings-content-text-color);
    font-weight: 500;
  }

  .ant-descriptions-bordered .ant-descriptions-item-content {
    background-color: var(--antd-modal-content-bg);
    color: var(--settings-content-text-color);
  }

  .ant-table {
    background: transparent;

    .ant-table-thead > tr > th {
      background: var(--antd-modal-header-bg);
      color: var(--antd-modal-title-color);
      border-bottom: 1px solid var(--settings-content-content-divider);
      font-weight: 500;
    }

    .ant-table-tbody > tr > td {
      background: var(--antd-modal-content-bg);
      color: var(--settings-content-text-color);
      border-bottom: 1px solid var(--settings-content-content-divider);
    }

    .ant-table-tbody > tr:hover > td {
      background: var(--settings-menu-active-bg) !important;
    }

    .ant-table-pagination {
      .ant-pagination-item {
        background: var(--settings-menu-default-bg);
        border: 1px solid var(--settings-content-content-divider);

        a {
          color: var(--settings-content-text-color);
        }

        &:hover {
          background: var(--settings-menu-active-bg);
          border-color: var(--settings-loadingIcon-color);

          a {
            color: var(--settings-loadingIcon-color);
          }
        }

        &.ant-pagination-item-active {
          background: var(--settings-loadingIcon-color);
          border-color: var(--settings-loadingIcon-color);

          a {
            color: var(--antd-modal-Confirm-defaultColor);
          }
        }
      }

      .ant-pagination-prev,
      .ant-pagination-next {
        background: var(--settings-menu-default-bg);
        border: 1px solid var(--settings-content-content-divider);

        &:hover {
          background: var(--settings-menu-active-bg);
          border-color: var(--settings-loadingIcon-color);

          .anticon {
            color: var(--settings-loadingIcon-color);
          }
        }

        .anticon {
          color: var(--settings-menu-default-color);
        }
      }

      .ant-pagination-disabled {
        background: var(--settings-menu-default-bg);
        opacity: 0.4;

        .anticon {
          color: var(--settings-menu-default-color);
        }

        &:hover {
          background: var(--settings-menu-default-bg);
          border-color: var(--settings-content-content-divider);
        }
      }
    }
  }

  .ant-timeline-item-tail {
    border-left-color: var(--settings-content-content-divider);
  }

  .ant-badge {
    .ant-badge-status-dot {
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3);
    }
  }

  .ant-tag {
    border-radius: 4px;
    font-size: 12px;
    padding: 2px 8px;
    font-weight: 500;

    &.ant-tag-success {
      background: rgba(82, 196, 26, 0.2);
      border-color: rgba(82, 196, 26, 0.4);
      color: #73d13d;
    }

    &.ant-tag-error {
      background: rgba(245, 63, 63, 0.2);
      border-color: rgba(245, 63, 63, 0.4);
      color: #ff7875;
    }
  }
`;

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
