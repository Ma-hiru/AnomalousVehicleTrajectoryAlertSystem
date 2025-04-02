import { Component, createApp, defineComponent } from "vue";
import { RefObject, useEffect } from "react";

type Data = Parameters<typeof createApp>[1];

/**
 * @description`useVueComponent 是一个自定义 Hook，用于在 React 组件中渲染 Vue 组件。`
 * @param CompositionComponent - Vue组合式API组件
 * @param HTMLContainer - Vue组件的容器
 * @param `props` - 传递给 Vue 组件的属性
 * @returns 无
 * */
export function useVueComponent<T extends ReturnType<typeof defineComponent>>(
  CompositionComponent: T,
  HTMLContainer: RefObject<HTMLDivElement | null>,
  props?: T extends { new(...args: any[]): { $props: infer P } } ? P : Record<string, any>
) {
  useEffect(() => {
    if (HTMLContainer.current) {
      const app = createApp(CompositionComponent as Component, props as Data);
      app.mount(HTMLContainer.current);
      return app.unmount;
    }
  }, [CompositionComponent, HTMLContainer, props]);
}


