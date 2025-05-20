import { FC, useSyncExternalStore } from "react";
import dayjs from "dayjs";

type props = object;

const BarInfo: FC<props> = () => {
  const time = useSyncExternalStore((listener) => {
    const timer = setInterval(listener, 1000);
    return () => {
      clearInterval(timer);
    };
  }, () => dayjs(Date.now()).format("YYYY-MM-DD HH:mm:ss"));
  return (
    <>
      <div>{time}</div>
    </>
  );
};
export default BarInfo;
