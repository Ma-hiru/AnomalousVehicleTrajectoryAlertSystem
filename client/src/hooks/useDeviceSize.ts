import { ref, onMounted, onUnmounted } from "vue";
import { screensConfig } from "@/settings/settings.ts";
import { useSyncExternalStore } from "react";

export function useDeviceSizeVue(size: keyof typeof screensConfig, mode: "min" | "max") {
  const mediaQuery = window.matchMedia(`(${mode}-width: ${screensConfig[size]}px)`);
  const res = ref(mediaQuery.matches);
  onMounted(() => {
    const handler = (event: MediaQueryListEvent) => {
      res.value = event.matches;
    };
    mediaQuery.addEventListener("change", handler);
    onUnmounted(() => {
      mediaQuery.removeEventListener("change", handler);
    });
  });
  return res;
}


export const useDeviceSizeReact = (size: keyof typeof screensConfig, mode: "min" | "max") => {
  const mediaQuery = window.matchMedia(`(${mode}-width: ${screensConfig[size]}px)`);
  const subscribe = (handler: () => any) => {
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  };
  return useSyncExternalStore(subscribe, () => mediaQuery.matches, () => false);
};




