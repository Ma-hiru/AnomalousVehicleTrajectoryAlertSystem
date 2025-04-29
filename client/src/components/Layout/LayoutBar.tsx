import { FC } from "react";
import { createStyleSheet } from "@/utils/createStyleSheet.ts";
import { TabsMenu } from "@/components/Layout/TabsMenu.tsx";
import LayoutUser from "@/components/Layout/LayoutUser.tsx";

type props = {
  currentRoute: string;
  setRoute: (path: string) => void;
  reload: () => void;
}

const LayoutBar: FC<props> = ({ currentRoute, setRoute, reload }) => {
  return (
    <>
      <div
        className="w-screen grid grid-rows-1 grid-cols-[1fr_auto_auto] items-center shadow-sm"
        style={styles.container}
      >
        <div style={styles.title}>
          AnomalousVehicleTrajectoryAlertSystem
        </div>
        <div style={styles.TabsMenu}>
          <TabsMenu currentRoute={currentRoute} setRoute={setRoute} />
        </div>
        <div>
          <LayoutUser reload={reload} />
        </div>
      </div>
    </>
  );
};
export default LayoutBar;
const styles = createStyleSheet({
  container: {
    height: "var(--layout-bar-height)",
    paddingRight: "calc(var(--spacing) * 4)",
    paddingLeft: "calc(var(--spacing) * 4)",
    backgroundColor: " var(--layout-bar-bg)",
    color: "var(--layout-bar-color)",
    borderBottom: "1px solid var(--layout-bar-border-color)",
    overflow: "hidden"
  },
  title: {
    color: "var(--layout-bar-title-color)",
    userSelect: "none"
  },
  TabsMenu: {
    minWidth: "20rem",
    height: "100%"
  }
});
