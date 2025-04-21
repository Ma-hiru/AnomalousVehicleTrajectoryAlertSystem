export const curryFirst = <A, T extends any[], R>(
  fn: (a: A, ...rest: T) => R,
  firstArg: A
): (...args: T) => R => {
  return (...restArgs: T) => fn(firstArg, ...restArgs);
};
