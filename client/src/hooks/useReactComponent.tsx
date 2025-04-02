import { Provider } from "react-redux";
import { watchEffect, type Ref } from "vue";
import { createRoot } from "react-dom/client";
import { StrictMode, FC, ReactNode } from "react";
import { PersistGate } from "redux-persist/integration/react";
import reduxStore, { PersistedRootState } from "@/stores/redux";

/**
 * @description`useReactComponent 是一个自定义 Hook，用于在 Vue 组件中渲染 React 组件。`
 * @param FnComponent - React函数组件
 * @param HTMLContainer - 组件的容器
 * @param props - 传递给 React 组件的属性
 * @param key - 用于设置组件的key属性
 * @returns void
 * */
export function useReactComponent<P>(
  FnComponent: FC<P>,
  HTMLContainer: Ref<HTMLDivElement | null | undefined>,
  props?: P,
  key?: Ref<string | number | undefined>
) {
  watchEffect(() => {
    if (HTMLContainer.value) {
      const root = createRoot(HTMLContainer.value);
      watchEffect(() => root.render(renderReactNode<P>(FnComponent, props, key)));
    }
  });
}

/**
 * @description`renderReactNode 是一个函数，用于渲染 React 组件。`
 * @param FnComponent - React函数组件
 * @param props - 传递给 React 组件的属性
 * @param key - 传递给 React 组件的key属性
 * @returns ReactNode
 * */
export function renderReactNode<P>(
  FnComponent: FC<any>,
  props?: P,
  key?: Ref<string | number | undefined>
): ReactNode {
  return (
    <StrictMode>
      <Provider store={reduxStore}>
        <PersistGate persistor={PersistedRootState}>
          <FnComponent {...props} key={key?.value} />
        </PersistGate>
      </Provider>
    </StrictMode>
  );
}
