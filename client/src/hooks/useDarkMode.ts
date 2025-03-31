import { useSyncExternalStore, useCallback } from "react";

export const useDarkMode = (): [isDark: boolean, change: () => void] => {
  return [
    useSyncExternalStore(
      (listener) => {
        const observer = new MutationObserver(listener);
        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["class"]
        });
        return () =>observer.disconnect();
      },
      () => document.documentElement.className.includes("darkMode")
    ),
    useCallback(
      () => document.documentElement.classList.toggle("darkMode")
      ,
      []
    )
  ];
};
