import { useSyncExternalStore, useMemo } from "react";
import { onMounted, onUnmounted, Ref, ref } from "vue";

const changeMode = () => {
  return document.documentElement.classList.toggle("darkMode");
};
const darkAnimate = (x: number, y: number, isDark: boolean) => {
  const Animate = () => {
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );
    const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`];
    document.documentElement.animate(
      { clipPath: isDark ? clipPath.reverse() : clipPath },
      {
        duration: 600,
        pseudoElement: isDark ? "::view-transition-old(root)" : "::view-transition-new(root)"
      }
    );
  };
  document.startViewTransition
    ? document.startViewTransition(changeMode).ready.then(Animate)
    : changeMode();
};
export const useDarkModeReact = (): {
  isDark: boolean;
  changeMode: () => boolean;
  darkAnimate: (x: number, y: number, isDark: boolean) => void;
} => {
  const isDark = useSyncExternalStore(
    (listener) => {
      const observer = new MutationObserver(listener);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"]
      });
      return () => observer.disconnect();
    },
    () => document.documentElement.className.includes("darkMode")
  );
  return useMemo(
    () => ({
      isDark,
      changeMode,
      darkAnimate
    }),
    [isDark]
  );
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
  return [isDark, changeMode];
};
