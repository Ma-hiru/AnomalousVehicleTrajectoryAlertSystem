import { FC, memo } from "react";
import { MyState } from "@/hooks/useMyState.ts";

interface props {
  currentContent: string | string[];
  currentIndex: string[];
  config: MyState<Go2rtcConfigYaml | undefined>;
}

const Content: FC<props> = ({ currentContent, currentIndex, config }) => {
  const updateConfig = (newContent: string | string[]) => {
    config.set(draft => {
      if (draft) {
        if (draft) {
          const level1 = currentIndex[0];
          const level2 = currentIndex[1];
          if (draft.data) {
            draft.data[level1][level2] = newContent;
          }
        }
      }
    });
  };
  const render = () => {
    if (typeof currentContent === "string") {
      return <div>{currentContent}</div>;
    } else if (typeof currentContent === "object") {
      return (currentContent as string[]).map(item => {
        return <div>{item}</div>;
      });
    }
  };
  return (
    <>
      <div onClick={() => {
        updateConfig(currentContent);
      }}>
        {render()}
      </div>
    </>
  );
};
export default memo(Content);

