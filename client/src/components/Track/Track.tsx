import { FC, memo, useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import styled from "styled-components";
import {
  Badge,
  Button,
  Card,
  Col,
  ConfigProvider,
  DatePicker,
  GetProps,
  Input,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  theme
} from "antd";
import MyModal from "@/components/MyModal";
import Detail from "@/components/Track/Detail";
import { useReactive } from "ahooks";
import { pinia, useStreamStore } from "@/stores/pinia";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";
import { useImmer } from "use-immer";
import { fetchDataAsync } from "@/utils/fetchData";
import { useTrackZustandStore } from "@/stores/zustand/track";
import { useShallow } from "zustand/react/shallow";
import { AlertOutlined, CarOutlined, ClockCircleOutlined, EyeOutlined } from "@ant-design/icons";
import AppSettings from "@/settings";

// 配置dayjs
dayjs.extend(relativeTime);
dayjs.locale("zh-cn");

const { Column } = Table;
type SearchProps = GetProps<typeof Input.Search>;

const Track: FC<object> = () => {
  //Data
  const streamStore = useStreamStore(pinia);
  const [totalTrack, setTotalTrack] = useState(0);
  const [currentDetail, setCurrentDetail] = useImmer([] as Track[]);
  const { currentTrackList, setTrackList, totalExceptionsCount } = useTrackZustandStore(
    useShallow((state) => ({
      currentTrackList: state.currentTrackList,
      setTrackList: state.setTrackList,
      totalExceptionsCount: state.totalExceptionsCount
    }))
  );

  //Search
  const defaultDate = useMemo<[dayjs.Dayjs, dayjs.Dayjs]>(() => {
    const now = dayjs();
    const dayStart = now.startOf("day");
    return [dayStart, now];
  }, []);
  const [query, setQuery] = useImmer({
    from: defaultDate[0].toDate().getTime().toString(),
    to: defaultDate[1].toDate().getTime().toString(),
    offset: "0",
    limit: "20",
    keywords: ""
  });

  const updateTrack = useCallback(async () => {
    const { ok, data } = await fetchDataAsync("req_track_get", [query]);
    ok && setTrackList(data.items);
    ok && setTotalTrack(data.total);
  }, [query, setTrackList]);

  const selectTime = useCallback(
    (values: dayjs.Dayjs[]) => {
      if (values && values.length === 2) {
        const [start, end] = values;
        setQuery((draft) => {
          draft.from = start.toDate().getTime().toString();
          draft.to = end.toDate().getTime().toString();
        });
      } else {
        setQuery((draft) => {
          draft.from = new Date().setHours(0, 0, 0, 0).toString();
          draft.to = new Date().getTime().toString();
        });
      }
    },
    [setQuery]
  );

  const onSearch = useCallback<NonNullable<SearchProps["onSearch"]>>(
    (keyword) => {
      setQuery((draft) => {
        draft.keywords = keyword;
      });
    },
    [setQuery]
  );

  //Modal
  const ShowModal = useReactive({
    detail: false
  });
  const closeDetailModal = useCallback(() => {
    ShowModal.detail = false;
  }, [ShowModal]);

  // 计算统计数据
  const [statistics, setStatistics] = useImmer({
    totalTracks: 0,
    totalAnomalies: 0,
    uniqueActions: 0,
    activeStreams: 0,
    latestTime: 0
  });
  useLayoutEffect(() => {
    const totalTracks = currentTrackList.length;
    const uniqueActions = new Set(currentTrackList.flatMap((track) => track.actionIds)).size;
    // 获取活跃的视频流数量
    const activeStreams = new Set(
      currentTrackList.flatMap((track) => track.track.map((t) => t.streamId))
    ).size;
    // 最近的异常时间
    const latestTime =
      currentTrackList.length > 0
        ? Math.max(...currentTrackList.map((track) => track.time))
        : Date.now();

    setStatistics({
      totalTracks,
      totalAnomalies: totalExceptionsCount,
      uniqueActions,
      activeStreams,
      latestTime
    });
  }, [currentTrackList, setStatistics, totalExceptionsCount]);
  useEffect(() => {
    updateTrack().catch();
    const timer = setInterval(updateTrack, AppSettings.UPDATE_RECORDS_INTERVAL);
    return () => clearInterval(timer);
  }, [updateTrack]);
  return (
    <>
      <TrackContainer>
        {/* 统计面板 */}
        <div className="statistics">
          <ConfigProvider theme={AntdCardTheme}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Card variant={"borderless"} size="small">
                  <Statistic
                    title={
                      <Space>
                        <CarOutlined style={{ color: "var(--settings-loadingIcon-color)" }} />
                        追踪车辆
                      </Space>
                    }
                    value={statistics.totalTracks}
                    suffix="辆"
                    valueStyle={{
                      color: "var(--settings-content-text-color)",
                      fontSize: "20px"
                    }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card variant={"borderless"} size="small">
                  <Statistic
                    title={
                      <Space>
                        <AlertOutlined style={{ color: "#fa541c" }} />
                        异常行为
                      </Space>
                    }
                    value={statistics.totalAnomalies}
                    suffix="次"
                    valueStyle={{ color: "#fa541c", fontSize: "20px" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card variant={"borderless"} size="small">
                  <Statistic
                    title={
                      <Space>
                        <EyeOutlined style={{ color: "#52c41a" }} />
                        监控流
                      </Space>
                    }
                    value={statistics.activeStreams}
                    suffix="路"
                    valueStyle={{ color: "#52c41a", fontSize: "20px" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card variant={"borderless"} size="small">
                  <Statistic
                    title={
                      <Space>
                        <ClockCircleOutlined
                          style={{ color: "var(--settings-loadingIcon-color)" }}
                        />
                        最新异常
                      </Space>
                    }
                    value={dayjs(statistics.latestTime).fromNow()}
                    valueStyle={{
                      color: "var(--settings-content-text-color)",
                      fontSize: "16px"
                    }}
                  />
                </Card>
              </Col>
            </Row>
          </ConfigProvider>
        </div>
        <div className="search">
          <ConfigProvider theme={AntdDatePickerTheme}>
            <DatePicker.RangePicker
              defaultValue={defaultDate}
              onChange={selectTime as any}
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              placeholder={["开始时间", "结束时间"]}
            />
          </ConfigProvider>
          <ConfigProvider theme={AntdSearchTheme}>
            <Input.Search
              value={query.keywords}
              onChange={(e) => {
                setQuery((draft) => {
                  draft.keywords = e.target.value;
                });
              }}
              placeholder="输入追踪标识"
              onSearch={onSearch}
              enterButton={"搜索记录"}
              allowClear
            />
          </ConfigProvider>
        </div>
        <div className="form">
          <ConfigProvider theme={AntdTableTheme}>
            <Table<TrackList>
              dataSource={currentTrackList}
              size="small"
              bordered
              scroll={{
                y: 55 * 6
              }}>
              <Column align="center" title={"标识"} dataIndex={"carId"} />
              <Column
                title={"行为"}
                dataIndex={"actionId"}
                align="center"
                render={(_, row: TrackList) =>
                  row.actionIds.map((type) => (
                    <Tag
                      key={type}
                      color="error"
                      style={{ marginBottom: "4px" }}
                      icon={<AlertOutlined color="#fa541c" />}>
                      {streamStore.ActionsEnum[type] || "未知行为"}
                    </Tag>
                  ))
                }
              />
              <Column
                title={"最近更新时间"}
                dataIndex={"time"}
                align="center"
                render={(_, row: TrackList) => new Date(row.time).toLocaleString()}
              />
              <Column
                title={"轨迹"}
                align="center"
                dataIndex={"track"}
                render={(_, row: TrackList) => (
                  <Space direction="vertical" size="small">
                    <Button
                      type="primary"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => {
                        setCurrentDetail(row.track);
                        ShowModal.detail = true;
                      }}>
                      查看详情
                    </Button>
                    <Badge
                      count={row.track.length}
                      size="small"
                      color="var(--settings-loadingIcon-color)"
                      title={`共${row.track.length}个轨迹段`}
                    />
                  </Space>
                )}
              />
            </Table>
          </ConfigProvider>
        </div>
      </TrackContainer>
      <MyModal
        title={"轨迹详情"}
        width={"55vw"}
        open={ShowModal.detail}
        onCancel={closeDetailModal}>
        <Detail track={currentDetail} />
      </MyModal>
    </>
  );
};
export default memo(Track);

const TrackContainer = styled.div`
  color: var(--settings-content-text-color);

  .statistics {
    margin-bottom: 20px;
  }

  .search {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }

  .form {
    margin-top: 20px;
  }
`;

const AntdCardTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "var(--settings-loadingIcon-color)",
    colorBgContainer: "var(--antd-modal-header-bg)",
    colorText: "var(--settings-content-text-color)",
    colorBorder: "var(--settings-content-content-divider)",
    borderRadius: 6
  },
  components: {
    Card: {
      colorBorderSecondary: "var(--settings-content-content-divider)",
      headerBg: "var(--antd-modal-header-bg)",
      colorBgContainer: "var(--antd-modal-content-bg)",
      paddingLG: 16
    },
    Statistic: {
      titleFontSize: 14,
      contentFontSize: 20
    }
  }
};

const AntdDatePickerTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "var(--settings-loadingIcon-color)",
    colorBgContainer: "var(--antd-modal-content-bg)",
    colorText: "var(--settings-content-text-color)",
    colorTextDisabled: "var(--settings-menu-default-color)",
    colorBorder: "var(--settings-content-content-divider)",
    colorIcon: "var(--settings-menu-default-color)",
    colorIconHover: "var(--settings-loadingIcon-color)"
  },
  components: {
    DatePicker: {
      cellHoverBg: "var(--settings-menu-active-bg)",
      cellActiveBg: "var(--settings-menu-actived-bg)",
      rangeBorderColor: "var(--settings-loadingIcon-color)",
      cellRangeBetweenBg: "var(--settings-menu-active-bg)",
      timeColumnBg: "var(--antd-modal-header-bg)",
      timeCellActiveBg: "var(--settings-menu-actived-bg)"
    }
  }
};

const AntdSearchTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "var(--settings-loadingIcon-color)",
    colorBgContainer: "var(--antd-modal-content-bg)",
    colorBorder: "var(--settings-content-content-divider)",
    colorText: "var(--settings-content-text-color)",
    colorTextPlaceholder: "var(--settings-menu-default-color)"
  },
  components: {
    Input: {
      colorPrimaryHover: "var(--settings-loadingIcon-color)",
      activeShadow: "0 0 0 2px rgba(24, 144, 255, 0.2)",
      paddingBlock: 8,
      borderRadius: 4,
      colorIcon: "var(--settings-menu-default-color)",
      colorIconHover: "var(--settings-loadingIcon-color)"
    },
    Button: {
      colorPrimary: "var(--settings-loadingIcon-color)",
      algorithm: true
    }
  }
};

const AntdTableTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorBgContainer: "var(--antd-modal-content-bg)",
    colorBorderSecondary: "var(--settings-content-content-divider)",
    colorText: "var(--settings-content-text-color)",
    colorTextHeading: "var(--settings-content-text-color)",
    colorSplit: "var(--settings-content-title-divider)"
  },
  components: {
    Table: {
      headerBg: "var(--antd-modal-header-bg)",
      rowHoverBg: "var(--settings-menu-active-bg)",
      headerSplitColor: "var(--settings-content-content-divider)",
      headerColor: "var(--antd-modal-title-color)",
      cellPaddingBlock: 16,
      rowSelectedBg: "var(--settings-menu-actived-bg)",
      stripe: true,
      colorFillAlter: "rgba(255,255,255,0.03)"
    },
    Pagination: {
      colorPrimary: "var(--settings-loadingIcon-color)",
      colorBgContainer: "var(--antd-modal-header-bg)"
    },
    Button: {
      colorPrimary: "var(--settings-loadingIcon-color)",
      algorithm: true
    }
  }
};
