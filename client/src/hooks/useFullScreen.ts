import { useSyncExternalStore, useCallback } from "react";

export const useFullScreen = (): [isfull: boolean, change: () => Promise<void>] => {
  return [
    useSyncExternalStore(
      (listener) => {
        document.addEventListener("fullscreenchange", listener);
        return () => {
          document.removeEventListener("fullscreenchange", listener);
        };
      },
      () => !!document.fullscreenElement,
      () => false
    ),
    useCallback(
      async () => {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        } else {
          await document.documentElement.requestFullscreen();
        }
      }, [])
  ];
};
