import { FC, memo } from "react";
import BarMenu from "@/components/TopBar/BarMenu.tsx";
import BarTitle from "@/components/TopBar/BarTitle.tsx";
import styled from "styled-components";
import BarInfo from "@/components/TopBar/BarInfo.tsx";

type props = {
  currentRoute: string;
  setRoute: (path: string) => void;
  reload: () => void;
}

const TopBar: FC<props> = () => {
  return (
    <>
      <StyledContainer
        className="w-screen grid grid-rows-1 grid-cols-[1fr_1fr_1fr] items-center shadow-sm overflow-hidden"
      >
        <BarInfo />
        <BarTitle />
        <BarMenu />
      </StyledContainer>
    </>
  );
};
export default memo(TopBar);
const StyledContainer = styled.div`
  height: var(--layout-bar-height);
  padding-right: calc(var(--spacing) * 4);
  padding-left: calc(var(--spacing) * 4);
`;


