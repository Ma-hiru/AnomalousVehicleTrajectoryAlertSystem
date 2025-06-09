import { InjectionKey, Ref } from "vue";

export const LayoutSplitSize = Symbol() as InjectionKey<Ref<number>>;
export const ActiveTitle = Symbol() as InjectionKey<Ref<string>>;
export const SetActiveTitle = Symbol() as InjectionKey<(title: string) => void>;
