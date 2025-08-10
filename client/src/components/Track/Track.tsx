import { FC, memo, useCallback, useMemo } from "react";
import styled from "styled-components";
import { Input, GetProps, ConfigProvider, Table, Button, theme, DatePicker, Tag } from "antd";
import MyModal from "@/components/MyModal";
import Detail from "@/components/Track/Detail";
import { useReactive } from "ahooks";
import { useStreamStore } from "@/stores/pinia";
import { pinia } from "@/stores/pinia";
import dayjs from "dayjs";
import { useImmer } from "use-immer";
import { fetchDataAsync } from "@/utils/fetchData";
import { useTrackZustandStore } from "@/stores/zustand/track";
import { useShallow } from "zustand/react/shallow";
import { useDebounceEffect } from "ahooks";

const { Column } = Table;
const { RangePicker } = DatePicker;
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

  return (
    <>
      <TrackContainer>
        <div className="search">
          <ConfigProvider theme={AntdDatePickerTheme}>
            <RangePicker
              defaultValue={defaultDate}
              onChange={selectTime as any}
              showTime
              format="YYYY-MM-DD HH:mm:ss"
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
                    return (
                      <Tag key={type} color={"red"}>
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
                  if (typeof row.time === "object" && row.time !== null && "time" in row.time) {
                    return new Date(row.time.time).toLocaleString();
                  } else if (typeof row.time === "number") {
                    return new Date(row.time).toLocaleString();
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
                  return (
                    <Button
                      onClick={() => {
                        setTrackDetail(row.track);
                        ShowModal.detail = true;
                      }}>
                      查看详情
                    </Button>
                  );
                }}
              />
            </Table>
          </ConfigProvider>
        </div>
      </TrackContainer>
      <MyModal
        title={"轨迹详情"}
        width={"60vw"}
        open={ShowModal.detail}
        onCancel={closeDetailModal}>
        <Detail track={currentTrackDetail} />
      </MyModal>
    </>
  );
};
export default memo(Track);

const TrackContainer = styled.div`
  color: white;

  .search {
    display: flex;
    gap: 10px;
  }

  .form {
    margin-top: 20px;
  }
`;
const AntdDatePickerTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "#1890ff",
    colorBgContainer: "#141414",
    colorText: "rgba(255,255,255,0.85)",
    colorTextDisabled: "rgba(255,255,255,0.3)",
    colorBorder: "#303030",
    colorIcon: "rgba(255,255,255,0.45)",
    colorIconHover: "#1890ff"
  },
  components: {
    DatePicker: {
      cellHoverBg: "rgba(255,255,255,0.08)",
      cellActiveBg: "rgba(24,144,255,0.2)",
      rangeBorderColor: "#1890ff",
      cellRangeBetweenBg: "rgba(24,144,255,0.1)",
      timeColumnBg: "#1d1d1d",
      timeCellActiveBg: "rgba(24,144,255,0.3)"
    }
  }
};
const AntdSearchTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "#1890ff",
    colorBgContainer: "#141414",
    colorBorder: "#303030",
    colorText: "rgba(255,255,255,0.85)",
    colorTextPlaceholder: "rgba(255,255,255,0.4)"
  },
  components: {
    Input: {
      colorPrimaryHover: "#40a9ff",
      activeShadow: "0 0 0 2px rgba(24, 144, 255, 0.2)",
      paddingBlock: 8,
      borderRadius: 4,
      colorIcon: "rgba(255,255,255,0.45)",
      colorIconHover: "#1890ff"
    }
  }
};
const AntdTableTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorBgContainer: "#141414",
    colorBorderSecondary: "#303030",
    colorText: "rgba(255,255,255,0.85)",
    colorTextHeading: "rgba(255,255,255,0.9)",
    colorSplit: "#262626"
  },
  components: {
    Table: {
      headerBg: "#1d1d1d",
      rowHoverBg: "rgba(255,255,255,0.08)",
      headerSplitColor: "#303030",
      headerColor: "#e6f4ff",
      cellPaddingBlock: 16,
      rowSelectedBg: "rgba(24,144,255,0.2)",
      stripe: true,
      colorFillAlter: "rgba(255,255,255,0.03)"
    },
    Pagination: {
      colorPrimary: "#1890ff",
      colorBgContainer: "#1d1d1d"
    }
  }
};
