type RemoveFirstArg<T extends (...args: any[]) => any> = T extends (first: any, ...args: infer P) => infer R ? (...args: P) => R : never;
