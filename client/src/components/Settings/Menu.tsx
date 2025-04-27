import { FC, useMemo } from "react";
import { MyState } from "@/hooks/useMyState.ts";
import SettingsIcon from "@/components/Settings/SettingsIcon.tsx";
import "./Menu.scss";

type props = {
  config: Go2rtcConfigYaml | undefined;
  currentContent: MyState<string | string[]>;
  currentIndex: MyState<string[]>;
};

const Menu: FC<props> = ({ config, currentContent, currentIndex }) => {
  const configContent = useMemo(() => {
    if (config && config.data) return config.data;
  }, [config]);
  const MenuTree = useMemo(() => {
    let firstSet = false;
    if (configContent) {
      return Object.keys(configContent).map((level1) =>
        <li key={level1}>
          <details open>
            <summary id="menu-summary">
              {<SettingsIcon name={level1} />}
              {level1}
            </summary>
            <ul>
              {
                Object.keys(configContent[level1]).map((level2) => {
                  if (currentIndex.get().length === 0 && !firstSet) {
                    currentIndex.set([level1, level2]);
                    currentContent.set(configContent[level1][level2]);
                    firstSet = true;
                  }
                  const active = currentIndex.get().join(".") === `${level1}.${level2}`;
                  return <li key={level2} onClick={() => {
                    currentContent.set(configContent[level1][level2]);
                    currentIndex.set([level1, level2]);
                  }}>
                    <a
                      id="menu-item"
                      className={active ? "active" : ""}
                      style={active ? {
                        background: "var(--settings-menu-actived-bg)",
                        color: "var(--settings-menu-actived-color)"
                      } : undefined}
                    >
                      {<SettingsIcon
                        name={active ? "dotWhite" : "dot"} />}
                      {level2}
                    </a>
                  </li>;
                })
              }
            </ul>
          </details>
        </li>
      );
    }
  }, [configContent, currentContent, currentIndex]);

  return (
    <>
      <ul className="menu menu-xs bg-white rounded-lg  max-w-xs w-full">
        {MenuTree}
      </ul>
    </>
  );
};
export default Menu;
