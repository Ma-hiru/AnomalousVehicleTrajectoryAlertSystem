import { useSyncExternalStore, useCallback } from "react";
import { onMounted, onUnmounted, Ref, ref } from "vue";

export const useFullScreenReact = (): [isfull: boolean, change: () => Promise<void>] => {
  return [
    useSyncExternalStore(
      (listener) => {
        document.addEventListener("fullscreenchange", listener, { passive: true });
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
export const useFullScreenVue = (): [isfull: Ref<boolean>, change: () => Promise<void>] => {
  const isFull = ref(false);
  const listener = () => {
    isFull.value = !!document.fullscreenElement;
  };
  const change = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  };
  onMounted(() => {
    document.addEventListener("fullscreenchange", listener);
  });
  onUnmounted(() => {
    document.removeEventListener("fullscreenchange", listener);
  });
  return [isFull, change];
};
