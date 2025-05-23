declare global {
  interface Function {
    before: <T, A extends any[], R>(
      this: (this: T, ...args: A) => R,
      beforeFn: (this: T, ...args: A) => void
    ) => (this: T, ...args: A) => R;
    after: <T, A extends any[], R>(
      this: (this: T, ...args: A) => R,
      afterFn: (this: T, ...args: A) => void
    ) => (this: T, ...args: A) => R;
  }
}
export const useFunctionDecorator = <T extends (...args: any[]) => any>(
  originalFn: T,
  beforeFn?: T,
  afterFn?: T
): T => {
  Function.prototype.before = function (beforeFn) {
    //这里的this指向是要修饰的函数
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const originalFn = this;
    return function (...args) {
      //这里的this指向是最后的调用者
      beforeFn.apply(this, args);
      return originalFn.apply(this, args);
    };
  };
  Function.prototype.after = function (afterFn) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const originalFn = this;
    return function (...args) {
      const res = originalFn.apply(this, args);
      afterFn.apply(this, args);
      return res;
    };
  };
  if (beforeFn && afterFn) {
    return originalFn.before(beforeFn).after(afterFn) as T;
  } else if (beforeFn) {
    return originalFn.before(beforeFn) as T;
  } else if (afterFn) {
    return originalFn.after(afterFn) as T;
  } else {
    return originalFn;
  }
};
