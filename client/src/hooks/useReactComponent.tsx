import { StrictMode, FC } from "react";
import { createRoot } from "react-dom/client";
import { watchEffect } from "vue";
import type { Ref } from "vue";
import { Provider } from "react-redux";
import reduxStore, { PersistedRootState } from "@/stores/redux";
import { PersistGate } from "redux-persist/integration/react";

/**
 * @description `渲染 React 组件到指定容器中。`
 * @param `FnComponent` -React函数组件
 * @param `HTMLContainer` -组件的容器
 * @param `props` - 传递给 React 组件的属性
 * @param key
 * @returns 无
 * */
export function renderReact(
  FnComponent: FC<Record<string, any>>,
  HTMLContainer: HTMLDivElement,
  props?: Record<string, any>,
  key?: string
) {
  const root = createRoot(HTMLContainer);
  root.render((
    <StrictMode>
      <Provider store={reduxStore}>
        <PersistGate persistor={PersistedRootState}>
          <FnComponent {...props} key={key} />
        </PersistGate>
      </Provider>
    </StrictMode>
  ));
}

/**
 * @description`useReactComponent 是一个自定义 Hook，用于在 Vue 组件中渲染 React 组件。`
 * @param FnComponent - React函数组件
 * @param HTMLContainer - 组件的容器
 * @param `props` - 传递给 React 组件的属性
 * @param key
 * @returns 无
 * */
export function useReactComponent<T extends FC<any>>(
  FnComponent: T,
  HTMLContainer: Ref<HTMLDivElement | null | undefined>,
  props?: T extends FC<infer P> ? P : never,
  key?: Ref<string | undefined>
) {
  watchEffect(() => {
    if (HTMLContainer.value) {
      renderReact(FnComponent, HTMLContainer.value, props, key?.value);
    }
  });
}
