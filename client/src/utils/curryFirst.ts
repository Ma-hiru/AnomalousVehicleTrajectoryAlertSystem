export const curryFirst = <T extends (...args: any[]) => any>(fn: T, firstArg: FirstParams<T>) => {
  return (...restArgs: RestParams<T>): ReturnType<T> => fn(firstArg, ...restArgs);
};
