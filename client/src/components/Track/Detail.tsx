import { FC, memo } from "react";

interface props {
  track: Track[];
}

const Detail: FC<props> = ({ track }) => {
  return <>{track.length}</>;
};
export default memo(Detail);
