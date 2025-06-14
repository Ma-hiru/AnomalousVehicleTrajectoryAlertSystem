import { FC, memo, useCallback, Key, useMemo } from "react";
import styled from "styled-components";
import { Input, GetProps, ConfigProvider, Table, Button, theme, DatePicker, Tag } from "antd";
import MyModal from "@/components/MyModal";
import Detail from "@/components/Track/Detail";
import { useReactive, useUpdate } from "ahooks";
import { ActionsEnum, useStreamStore } from "@/stores/pinia/modules/streamStore";
import { pinia } from "@/stores/pinia";
import dayjs from "dayjs";
import { useImmer } from "use-immer";
import { ReqTrackList } from "@/api/mock";

const { Column } = Table;
const { RangePicker } = DatePicker;
type SearchProps = GetProps<typeof Input.Search>;

const data: (TrackList & { key: Key })[] = ReqTrackList();
// eslint-disable-next-line
const streamStore = useStreamStore(pinia);
const Track: FC<object> = () => {
  //Data
  const [tableData, setTableData] = useImmer(data);
  //Search
  const searchParams = useReactive({
    text: "",
    timeRange: [] as number[]
  });
  const selectTime = ([start, end]: dayjs.Dayjs[]) => {
    console.log(start.unix(), end.unix());
    searchParams.timeRange[0] = start.unix();
    searchParams.timeRange[1] = end.unix();
  };
  const onSearch = useCallback<NonNullable<SearchProps["onSearch"]>>(
    (keyword) => {
      setTableData(
        ReqTrackList({
          keyword,
          start: searchParams.timeRange[0],
          end: searchParams.timeRange[1]
        })
      );
    },
    [searchParams.timeRange, setTableData]
  );
  const today = new Date().getDay();
  const defaultDate = useMemo<[dayjs.Dayjs, dayjs.Dayjs]>(() => {
    return [dayjs(new Date()), dayjs(new Date())];
    //eslint-disable-next-line
  }, [today]);
  //Modal
  const ShowModal = useReactive({
    detail: false
  });
  const closeDetailModal = useCallback(() => {
    ShowModal.detail = false;
  }, [ShowModal]);
  const [track, setTrack] = useImmer<Track[]>([]);

  return (
    <>
      <TrackContainer>
        <div className="search">
          <ConfigProvider theme={AntdDatePickerTheme}>
            <RangePicker defaultValue={defaultDate} onChange={selectTime as any} showNow />
          </ConfigProvider>
          <ConfigProvider theme={AntdSearchTheme}>
            <Input.Search
              value={searchParams.text}
              onChange={(e) => {
                searchParams.text = e.target.value;
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
              dataSource={data}
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
                    return (
                      <Tag key={type} color={"red"}>
                        {ActionsEnum[type]}
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
                  return new Date(row.time).toLocaleString();
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
                        setTrack(row.track);
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
        <Detail track={track} />
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
