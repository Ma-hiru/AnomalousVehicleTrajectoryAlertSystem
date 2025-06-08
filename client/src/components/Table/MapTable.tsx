import { FC } from "react";
import { Space, Table, Tag, TableProps } from "antd";
import AppCard from "@/components/AppCard.tsx";
import "./MapTable.scss";

const columns: TableProps<CarRecord>["columns"] = [
  {
    title: "标识",
    dataIndex: "carId",
    key: "carId",
    render: (text) => <a>{text}</a>,
  },
  {
    title: "时间",
    dataIndex: "time",
    key: "time",
  },
  {
    title: "行为",
    key: "tags",
    dataIndex: "tags",
    render: (_, { types }) => (
      <>
        {types.map((tag) => {
          return (
            <Tag color={"volcano"} key={tag}>
              {tag}
            </Tag>
          );
        })}
      </>
    )
  },
  {
    title: "操作",
    key: "action",
    render: (_, record) => (
      <Space size="middle">
        <a>Invite {record.carId}</a>
        <a>Delete</a>
      </Space>
    )
  }
];
const data: CarRecord[] = [
  {
    id: 0,
    carId: "xj114",
    stream: "ffmpeg",
    time: "2023-05-05 09:09:09",
    status: false,
    types: [0, 1]
  },
  {
    id: 1,
    carId: "xj114",
    stream: "ffmpeg",
    time: "2023-05-05 09:09:09",
    status: false,
    types: [0, 1]
  },
  {
    id: 2,
    carId: "xj114",
    stream: "ffmpeg",
    time: "2023-05-05 09:09:09",
    status: false,
    types: [0, 1]
  },
  {
    id: 0,
    carId: "xj114",
    stream: "ffmpeg",
    time: "2023-05-05 09:09:09",
    status: true,
    types: [0, 1]
  },
  {
    id: 1,
    carId: "xj114",
    stream: "ffmpeg",
    time: "2023-05-05 09:09:09",
    status: false,
    types: [0, 1]
  },
  {
    id: 2,
    carId: "xj114",
    stream: "ffmpeg",
    time: "2023-05-05 09:09:09",
    status: false,
    types: [0, 1]
  },
  {
    id: 0,
    carId: "xj114",
    stream: "ffmpeg",
    time: "2023-05-05 09:09:09",
    status: true,
    types: [0, 1]
  },
  {
    id: 1,
    carId: "xj114",
    stream: "ffmpeg",
    time: "2023-05-05 09:09:09",
    status: false,
    types: [0, 1]
  },
  {
    id: 2,
    carId: "xj114",
    stream: "ffmpeg",
    time: "2023-05-05 09:09:09",
    status: false,
    types: [0, 1]
  }
];
const MapTable: FC = () => {
  return (
    <>
      <AppCard>
        <div className="text-center font-bold mb-2">最新动态</div>
        <Table<CarRecord>
          className="map-table w-full h-full"
          columns={columns}
          rowClassName={(record) => {
            return record.status ? "table-row-warn" : "table-row-normal";
          }}
          dataSource={data}
          pagination={false}
          bordered={true}
          scroll={{ y: 3 * 55 }}
        />
      </AppCard>
    </>
  );
};

export default MapTable;
