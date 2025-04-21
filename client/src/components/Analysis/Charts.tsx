import { CSSProperties, FC, memo } from "react";

interface props {
  containerStyle: CSSProperties;
}

const Charts: FC<props> = ({containerStyle}) => {
  return (
    <>
      <div className="bg-blue-200" style={containerStyle}>
        charts
      </div>
    </>
  );
};
export default memo(Charts);
