import { Provider } from "react-redux";
import {
  watchEffect,
  type Ref,
  Reactive,
  onUnmounted
} from "vue";
import { createRoot, Root } from "react-dom/client";
import { FC, ReactNode } from "react";
import { PersistGate } from "redux-persist/integration/react";
import reduxStore, { PersistedRootState } from "@/stores/redux";
import { ConfigProvider } from "antd";
import locale from "antd/locale/zh_CN";

/**
 * @author: Ma-hiru
 * @description`useReactComponent 是一个自定义 Hook，用于在 Vue 组件中渲染 React 组件。`
 * @param FnComponent - React函数组件
 * @param HTMLContainer - 组件的容器
 * @param props - 传递给 React 组件的属性
 * @param key - 用于设置组件的key属性
 * @param alone - 是否独立
 * @returns void
 * */
export function useReactComponent<P>(
  FnComponent: FC<P>,
  HTMLContainer: Ref<HTMLDivElement | null | undefined>,
  props?: P,
  key?: Ref<string | number | undefined>,
  alone?: boolean
) {
  let root: Root;
  watchEffect(() => {
    if (HTMLContainer.value) {
      root = createRoot(HTMLContainer.value);
      if (alone) watchEffect(() => root.render(renderReactNodeAlone<P>(FnComponent, props, key)));
      else watchEffect(() => root.render(renderReactNode<P>(FnComponent, props, key)));
    }
  });
  onUnmounted(() => {
    if (root) root.unmount();
  });
}

export function useReactComponentReactive<P>(
  FnComponent: FC<P>,
  HTMLContainer: Ref<HTMLDivElement | null | undefined>,
  props?: Reactive<P>,
  key?: Ref<string | number | undefined>,
  alone?: boolean
) {
  let root: Root;
  watchEffect(() => {
    if (HTMLContainer.value) {
      root = createRoot(HTMLContainer.value);
      if (alone) watchEffect(() => root.render(renderReactNodeAloneReactive<P>(FnComponent, props, key)));
      else watchEffect(() => root.render(renderReactNodeReactive<P>(FnComponent, props, key)));
    }
  });
  onUnmounted(() => {
    if (root) root.unmount();
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
    <Provider store={reduxStore}>
      <PersistGate persistor={PersistedRootState}>
        <ConfigProvider locale={locale}>
          <FnComponent {...props} key={key?.value} />
        </ConfigProvider>
      </PersistGate>
    </Provider>
  );
}

export function renderReactNodeAlone<P>(
  FnComponent: FC<any>,
  props?: P,
  key?: Ref<string | number | undefined>
): ReactNode {
  return (
    <ConfigProvider locale={locale}>
      <FnComponent {...props} key={key?.value} />
    </ConfigProvider>
  );
}

export function renderReactNodeReactive<P>(
  FnComponent: FC<any>,
  props?: Reactive<P>,
  key?: Ref<string | number | undefined>
): ReactNode {
  return (
    <Provider store={reduxStore}>
      <PersistGate persistor={PersistedRootState}>
        <ConfigProvider locale={locale}>
          <FnComponent {...props} key={key?.value} />
        </ConfigProvider>
      </PersistGate>
    </Provider>
  );
}

export function renderReactNodeAloneReactive<P>(
  FnComponent: FC<any>,
  props?: Reactive<P>,
  key?: Ref<string | number | undefined>
): ReactNode {
  return (
    <ConfigProvider locale={locale}>
      <FnComponent {...props} key={key?.value} />
    </ConfigProvider>
  );
}
