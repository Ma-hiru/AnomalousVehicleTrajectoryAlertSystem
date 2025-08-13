import { FC, memo, useCallback, useMemo } from "react";
import styled from "styled-components";
import {
  Input,
  GetProps,
  ConfigProvider,
  Table,
  Button,
  theme,
  DatePicker,
  Tag,
  Space,
  Statistic,
  Card,
  Row,
  Col,
  Badge
} from "antd";
import MyModal from "@/components/MyModal";
import Detail from "@/components/Track/Detail";
import { useReactive } from "ahooks";
import { useStreamStore } from "@/stores/pinia";
import { pinia } from "@/stores/pinia";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";
import { useImmer } from "use-immer";
import { fetchDataAsync } from "@/utils/fetchData";
import { useTrackZustandStore } from "@/stores/zustand/track";
import { useShallow } from "zustand/react/shallow";
import { useDebounceEffect } from "ahooks";
import { AlertOutlined, EyeOutlined, CarOutlined, ClockCircleOutlined } from "@ant-design/icons";

// 配置dayjs
dayjs.extend(relativeTime);
dayjs.locale("zh-cn");

const { Column } = Table;
type SearchProps = GetProps<typeof Input.Search>;

const Track: FC<object> = () => {
  //Data
  const streamStore = useStreamStore(pinia);
  const { currentTrackList, setTrackList, setTrackDetail, currentTrackDetail } =
    useTrackZustandStore(
      useShallow((state) => ({
        currentTrackList: state.currentTrackList,
        currentTrackDetail: state.currentTrackDetail,
        setTrackList: state.setTrackList,
        setTrackDetail: state.setTrackDetail
      }))
    );
  //Search
  const defaultDate = useMemo<[dayjs.Dayjs, dayjs.Dayjs]>(() => {
    const now = dayjs();
    const dayStart = now.startOf("day");
    return [dayStart, now];
  }, []);

  const [query, setQuery] = useImmer({
    from: defaultDate[0].toDate().setHours(0, 0, 0, 0).toString(),
    to: defaultDate[1].toDate().getTime().toString(),
    offset: "0",
    limit: "20",
    keywords: ""
  });

  useDebounceEffect(() => {
    fetchDataAsync("req_track_get", [query]).then((res) => {
      setTrackList(res.data);
    });
  }, [query, setTrackList]);

  const selectTime = (values: dayjs.Dayjs[]) => {
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
  };

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
  const statistics = useMemo(() => {
    const totalTracks = currentTrackList.length;
    const totalAnomalies = currentTrackList.reduce((sum, track) => sum + track.actionIds.length, 0);
    const uniqueActions = new Set(currentTrackList.flatMap((track) => track.actionIds)).size;

    // 获取活跃的视频流数量
    const activeStreams = new Set(
      currentTrackList.flatMap((track) => track.track.map((t) => t.streamId))
    ).size;

    // 最近的异常时间
    const latestTime =
      currentTrackList.length > 0
        ? Math.max(
            ...currentTrackList.map((track) => {
              if (typeof track.time === "object" && track.time !== null && "time" in track.time) {
                return track.time.time;
              } else if (typeof track.time === "number") {
                return track.time;
              }
              return 0;
            })
          )
        : Date.now();

    return {
      totalTracks,
      totalAnomalies,
      uniqueActions,
      activeStreams,
      latestTime
    };
  }, [currentTrackList]);

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
                render={(_, row: TrackList) => {
                  return row.actionIds.map((type) => {
                    const actionName = streamStore.ActionsEnum[type] || "未知行为";
                    // 根据行为类型设置不同颜色，但异常行为统一使用红色图标
                    let color = "error"; // 默认异常为红色
                    if (
                      actionName.includes("正常") ||
                      actionName.toLowerCase().includes("normal")
                    ) {
                      color = "success";
                    } else if (actionName.includes("危险") || actionName.includes("急")) {
                      color = "error";
                    } else if (actionName.includes("违规") || actionName.includes("禁")) {
                      color = "warning";
                    } else {
                      color = "error"; // 所有异常统一为红色
                    }

                    const isNormal =
                      actionName.includes("正常") || actionName.toLowerCase().includes("normal");

                    return (
                      <Tag
                        key={type}
                        color={color}
                        style={{ marginBottom: "4px" }}
                        icon={
                          <AlertOutlined style={{ color: isNormal ? "#52c41a" : "#fa541c" }} />
                        }>
                        {actionName}
                      </Tag>
                    );
                  });
                }}
              />
              <Column
                title={"最近更新时间"}
                dataIndex={"time"}
                align="center"
                render={(_, row: TrackList) => {
                  console.log("time", row.time);
                  if (typeof row.time === "object" && row.time !== null && "time" in row.time) {
                    return new Date(row.time.time).toLocaleString();
                  } else {
                    return "未知时间";
                  }
                }}
              />
              <Column
                title={"轨迹"}
                align="center"
                dataIndex={"track"}
                render={(_, row: TrackList) => {
                  const trackCount = row.track.length;
                  return (
                    <Space direction="vertical" size="small">
                      <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => {
                          setTrackDetail(row.track);
                          ShowModal.detail = true;
                        }}>
                        查看详情
                      </Button>
                      <Badge
                        count={trackCount}
                        size="small"
                        color="var(--settings-loadingIcon-color)"
                        title={`共${trackCount}个轨迹段`}
                      />
                    </Space>
                  );
                }}
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
        <Detail track={currentTrackDetail} />
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
