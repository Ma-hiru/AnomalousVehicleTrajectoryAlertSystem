import { FC, memo } from "react";
import Map from "@/components/Map/Map.tsx";
import { MyState } from "@/hooks/useMyState.ts";
import Logger from "@/utils/logger.ts";

type props = {
  position: MyState<StreamPosition>
};

const SelectMap: FC<props> = () => {
  return (
    <>
      <Map
        containerStyle={{
          width: "100%",
          height: "90%"
        }}
        onDbClickMap={(e) => {
          
          Logger.Echo({ e });
        }}
      />
    </>
  );
};
export default memo(SelectMap);
