export const decorationFunc = <P extends any[], R>(
  Func: (...args: P) => R,
  before?: () => void,
  after?: () => void
) => {
  return (...args: P): R => {
    before && before();
    const res = Func(...args);
    after && after();
    return res;
  };
};
