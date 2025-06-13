import { FC, memo, useCallback, Key, useState } from "react";
import styled from "styled-components";
import { Input, GetProps, ConfigProvider, Table, Button, theme, DatePicker } from "antd";
import MyModal from "@/components/MyModal";
import Detail from "@/components/Track/Detail";
import { useReactive } from "ahooks";

const { Column } = Table;
const { RangePicker } = DatePicker;
type SearchProps = GetProps<typeof Input.Search>;

interface DataType {
  key: Key;
  name: string;
  age: number;
  address: string;
}

const data: DataType[] = [
  {
    key: "1",
    name: "John Brown",
    age: 32,
    address: "New York No. 1 Lake Park"
  },
  {
    key: "2",
    name: "Jim Green",
    age: 42,
    address: "London No. 1 Lake Park"
  },
  {
    key: "3",
    name: "Joe Black",
    age: 32,
    address: "Sydney No. 1 Lake Park"
  }
];
const Track: FC<object> = () => {
  const onSearch = useCallback<NonNullable<SearchProps["onSearch"]>>((value, _e, info) => {}, []);
  const ShowModal = useReactive({
    detail: false
  });
  const closeDetailModal = useCallback(() => {
    ShowModal.detail = false;
  }, [ShowModal]);
  const [currentCarId, setCurrentCarId] = useState("");
  return (
    <>
      <TrackContainer>
        <div className="search">
          <ConfigProvider theme={AntdDatePickerTheme}>
            <RangePicker />
          </ConfigProvider>
          <ConfigProvider theme={AntdSearchTheme}>
            <Input.Search
              placeholder="输入追踪标识"
              onSearch={onSearch}
              enterButton={"搜索记录"}
              allowClear
            />
          </ConfigProvider>
        </div>
        <div className="form">
          <ConfigProvider theme={AntdTableTheme}>
            <Table<DataType>
              dataSource={data}
              size="small"
              bordered
              scroll={{
                y: 55 * 6
              }}>
              <Column title={"标识"} dataIndex={"name"}></Column>
              <Column title={"行为"} dataIndex={"age"}></Column>
              <Column title={"最近更新时间"} dataIndex={"address"}></Column>
              <Column
                title={"查看轨迹(点击查看详情)"}
                dataIndex={"address"}
                render={() => {
                  return (
                    <Button
                      onClick={() => {
                        setCurrentCarId(Math.random().toString());
                        ShowModal.detail = true;
                      }}>
                      查看轨迹
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
        <Detail carId={currentCarId} />
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
