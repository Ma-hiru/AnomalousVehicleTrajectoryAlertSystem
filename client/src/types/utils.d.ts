type RemoveFirstArg<T extends (...args: any[]) => any> = T extends (
  first: any,
  ...args: infer P
) => infer R
  ? (...args: P) => R
  : never;
type RestParams<T> = T extends (firstArg: any, ...args: infer R) => any ? R : never;
type FirstParams<T> = T extends (firstArg: infer F, ...args: any[]) => any ? F : never;
type NormalFunc = () => void;
type Nullable<T> = T | null | undefined;
type Null<T> = T | null;
