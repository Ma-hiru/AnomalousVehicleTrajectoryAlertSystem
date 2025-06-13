import { FC, memo } from "react";

interface props {
  carId: string;
}

const Detail: FC<props> = ({ carId }) => {
  return <>{carId}</>;
};
export default memo(Detail);
