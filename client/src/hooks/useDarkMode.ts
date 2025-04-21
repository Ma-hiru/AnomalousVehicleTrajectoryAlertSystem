import { useSyncExternalStore, useCallback } from "react";
import { onMounted, onUnmounted, Ref, ref } from "vue";

export const useDarkModeReact = (): [isDark: boolean, change: () => void] => {
  return [
    useSyncExternalStore(
      (listener) => {
        const observer = new MutationObserver(listener);
        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["class"]
        });
        return () => observer.disconnect();
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
export const useDarkModeVue = (): [isDark: Ref<boolean>, change: () => boolean] => {
  const isDark = ref(document.documentElement.className.includes("darkMode"));
  const observer = ref<MutationObserver>();
  onMounted(() => {
    observer.value = new MutationObserver(() => {
      isDark.value = document.documentElement.className.includes("darkMode");
    });
    observer.value.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });
  });
  onUnmounted(() => {
    observer.value?.disconnect();
  });
  return [isDark, () => document.documentElement.classList.toggle("darkMode")];
};
