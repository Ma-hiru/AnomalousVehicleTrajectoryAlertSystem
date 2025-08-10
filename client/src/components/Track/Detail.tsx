import { FC, memo, useState } from "react";
import { Table, Timeline, Card, Descriptions, Badge, Tabs, Tag, ConfigProvider, theme } from "antd";
import styled from "styled-components";
import { useStreamStore } from "@/stores/pinia";
import { pinia } from "@/stores/pinia";

interface props {
  track: Track[];
}

const Detail: FC<props> = ({ track }) => {
  const [activeTabKey, setActiveTabKey] = useState<string>(
    track.length > 0 ? `${track[0].streamId}` : "0"
  );
  const streamStore = useStreamStore(pinia);

  // 获取视频流名称
  const getStreamName = (streamId: number) => {
    const stream = streamStore.StreamList.find((s) => s.streamId === streamId);
    return stream ? stream.streamName : `视频流 ${streamId}`;
  };

  // 根据时间排序记录
  const sortRecordsByTime = (records: CarRecord[]) => {
    return [...records].sort((a, b) => a.time - b.time);
  };

  // 按照时间顺序排序轨迹
  const sortedTrack = [...track].sort((a, b) => a.timeRange[0] - b.timeRange[0]);

  const timelineItems = sortedTrack.map((t) => {
    const streamName = getStreamName(t.streamId);
    // 格式化开始和结束时间
    const startTime = new Date(t.timeRange[0]).toLocaleString();
    const endTime = new Date(t.timeRange[1]).toLocaleString();

    return {
      key: `${t.streamId}`,
      label: streamName,
      children: (
        <div>
          <Descriptions title="视频流信息" bordered size="small">
            <Descriptions.Item label="视频ID">{t.streamId}</Descriptions.Item>
            <Descriptions.Item label="视频名称">{streamName}</Descriptions.Item>
            <Descriptions.Item label="首次出现">{startTime}</Descriptions.Item>
            <Descriptions.Item label="最后出现">{endTime}</Descriptions.Item>
            <Descriptions.Item label="记录数量">{t.records.length}</Descriptions.Item>
          </Descriptions>

          <div style={{ marginTop: "20px" }}>
            <h3>车辆行为记录</h3>
            <Table
              dataSource={sortRecordsByTime(t.records as any).map((r, i) => ({ ...r, key: i }))}
              pagination={{ pageSize: 5 }}
              size="small"
              bordered>
              <Table.Column
                title="时间"
                dataIndex="time"
                key="time"
                render={(time) => new Date(time).toLocaleString()}
              />
              <Table.Column
                title="行为"
                dataIndex="actionId"
                key="actionId"
                render={(actionId) => {
                  const actionName = streamStore.ActionsEnum[actionId] || "未知行为";
                  return <Tag color={actionId === 0 ? "green" : "red"}>{actionName}</Tag>;
                }}
              />
              <Table.Column
                title="状态"
                dataIndex="status"
                key="status"
                render={(status) => (
                  <Badge status={status ? "success" : "error"} text={status ? "正常" : "异常"} />
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
          <Card title="轨迹概览 (时间顺序)" bordered={false}>
            <Timeline
              mode="left"
              items={sortedTrack.map((t, index) => ({
                label: new Date(t.timeRange[0]).toLocaleString(),
                children: (
                  <div>
                    <h4>{getStreamName(t.streamId)}</h4>
                    <p>
                      出现时间: {new Date(t.timeRange[0]).toLocaleString()} -
                      {new Date(t.timeRange[1]).toLocaleString()}
                    </p>
                    <p>记录数: {t.records.length}</p>
                  </div>
                ),
                color: index === 0 ? "blue" : index === sortedTrack.length - 1 ? "red" : "green"
              }))}
            />
          </Card>
        </div>
        <div className="track-details">
          <Tabs
            activeKey={activeTabKey}
            onChange={setActiveTabKey}
            type="card"
            items={timelineItems}
          />
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
  color: rgba(255, 255, 255, 0.85);

  .track-summary {
    margin-bottom: 20px;
  }

  .track-details {
    flex: 1;
  }

  h3,
  h4 {
    color: rgba(255, 255, 255, 0.85);
    margin-bottom: 12px;
  }

  p {
    color: rgba(255, 255, 255, 0.65);
    margin-bottom: 8px;
  }

  .ant-timeline-item-label {
    width: 120px !important;
    color: rgba(255, 255, 255, 0.65);
  }

  .ant-timeline-item-content {
    left: 140px !important;
  }

  .ant-card {
    background: #1f1f1f;
    border-color: #303030;
  }

  .ant-descriptions-bordered .ant-descriptions-item-label {
    background-color: #262626;
  }
`;
const AntdTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "#1890ff",
    colorBgContainer: "#141414",
    colorText: "rgba(255,255,255,0.85)",
    colorBgElevated: "#1f1f1f",
    colorBorder: "#303030"
  },
  components: {
    Card: {
      colorBorderSecondary: "#303030",
      headerBg: "#1d1d1d"
    },
    Tabs: {
      colorBorderSecondary: "#303030",
      cardBg: "#1d1d1d",
      itemHoverColor: "#1890ff",
      cardHeight: 40
    },
    Descriptions: {
      colorTextHeading: "rgba(255,255,255,0.85)",
      colorBgContainer: "#1f1f1f",
      colorSplit: "#303030",
      labelBg: "#262626"
    },
    Table: {
      headerBg: "#1d1d1d",
      rowHoverBg: "rgba(255,255,255,0.08)",
      headerSplitColor: "#303030",
      headerColor: "#e6f4ff",
      cellPaddingBlock: 12,
      colorBgContainer: "#1f1f1f",
      colorText: "rgba(255,255,255,0.85)",
      rowSelectedBg: "rgba(24,144,255,0.2)",
      colorFillAlter: "rgba(255,255,255,0.03)",
      colorBorderSecondary: "#303030"
    },
    Timeline: {
      tailColor: "rgba(255,255,255,0.2)"
    }
  }
};
