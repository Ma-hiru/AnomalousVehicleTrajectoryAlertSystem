import { createApp, DefineComponent, defineComponent } from "vue";
import { RefObject, useEffect } from "react";

/**
 * @description `渲染 Vue 组件到指定容器中。`
 * @param CompositionComponent - Vue组合式API组件
 * @param HTMLContainer - Vue组件的容器
 * @param `props` - 传递给 Vue 组件的属性
 * @returns 一个函数，用于卸载 Vue 组件
 */
export function renderVue(
  CompositionComponent: DefineComponent<any, any, any>,
  HTMLContainer: HTMLDivElement,
  props: Record<string, any>
) {
  const app = createApp(CompositionComponent, props);
  app.mount(HTMLContainer);
  return app.unmount;
}

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
  props?: T extends { new(...args: any[]): { $props: infer P } }
    ? P
    : never
) {
  useEffect(() => {
    if (HTMLContainer.current) {
      return renderVue(
        CompositionComponent as DefineComponent,
        HTMLContainer.current,
        props as Record<string, any>
      );
    }
  }, [CompositionComponent, HTMLContainer, props]);
}
