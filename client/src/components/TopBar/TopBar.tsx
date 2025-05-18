import { FC, memo } from "react";
import BarUser from "@/components/TopBar/BarMenu.tsx";
import BarTitle from "@/components/TopBar/BarTitle.tsx";
import styled from "styled-components";

type props = {
  currentRoute: string;
  setRoute: (path: string) => void;
  reload: () => void;
}

const TopBar: FC<props> = () => {
  return (
    <>
      <StyledContainer
        className="w-screen grid grid-rows-1 grid-cols-[1fr_auto] items-center shadow-sm overflow-hidden"
      >
        <StyledTitle className="select-none">
          <BarTitle />
        </StyledTitle>
        <div>
          <BarUser />
        </div>
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
const StyledTitle = styled.div`
`;

