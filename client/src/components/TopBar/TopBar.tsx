import { FC, memo } from "react";
import BarMenu from "@/components/TopBar/BarMenu.tsx";
import BarTitle from "@/components/TopBar/BarTitle.tsx";
import styled from "styled-components";
import BarInfo from "@/components/TopBar/BarInfo.tsx";

type props = {
  currentRoute: string;
  setRoute: (path: string) => void;
  reload: () => void;
};

const TopBar: FC<props> = () => {
  return (
    <>
      <StyledContainer className="shadow-sm">
        <BarInfo />
        <BarTitle />
        <BarMenu />
      </StyledContainer>
    </>
  );
};
export default memo(TopBar);
const StyledContainer = styled.div`
  width: 100%;
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: repeat(3, 1fr);
  overflow: hidden;
  align-items: center;
  height: var(--layout-bar-height);
  padding-right: calc(var(--spacing) * 4);
  padding-left: calc(var(--spacing) * 4);
  color: var(--layout-bar-color);
  background: var(--layout-bar-bg);
`;
