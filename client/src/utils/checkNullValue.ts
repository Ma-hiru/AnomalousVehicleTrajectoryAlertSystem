import Logger from "@/utils/logger.ts";

export const getSafeValue = <T>(value: any, defaultValue: T, deep?: boolean, nullVal?: any[]): T => {
  try {
    if (value === defaultValue) return value;
    //  浅层检查类型和null
    const checkTypeAndNull = (): T => {
      //类型不匹配尝试转换 否则直接返回默认值
      if (typeof value !== typeof defaultValue) {
        if (typeof defaultValue === "number" && !Number.isNaN(Number(value))) {
          return Number(value) as T;
        }
        if (typeof defaultValue === "string" && !Number.isNaN(Number(defaultValue)) && typeof value === "number") {
          return String(value) as T;
        }
        if (typeof defaultValue === "boolean" && (value === "true" || value === "false")) {
          return Boolean(value) as T;
        }
        if ((defaultValue === "false" || defaultValue === "true") && typeof value === "boolean") {
          return String(value) as T;
        }
        return defaultValue;
      }
      //区分对象和数组，如果一个是数组，另一个不是（是对象），返回默认值
      if (Array.isArray(value) !== Array.isArray(defaultValue)) return defaultValue;
      //类型匹配，但是为预设的null值，返回默认值
      if (nullVal) {
        for (const nVal of nullVal)
          if (value === nVal) return defaultValue;
      }
      //类型匹配，且不为预设的null值，返回原始值
      return value;
    };
    // 深层检查类型和null
    if (deep) {
      // 首先浅层检查类型和null
      let checkedVal = checkTypeAndNull();
      if (checkedVal === defaultValue) return checkedVal;
      if (typeof defaultValue === "object" && !Array.isArray(checkedVal)) {
        for (const key in defaultValue) {
          checkedVal[key] = getSafeValue(checkedVal[key], defaultValue[key], true, nullVal);
        }
      }
      if (typeof defaultValue === "object" && Array.isArray(checkedVal)) {
        (checkedVal as T[]) = checkedVal.map(item => getSafeValue(item, (defaultValue as T[])![0], true, nullVal));
      }
      return checkedVal;
    }
    return checkTypeAndNull();
  } catch (e) {
    Logger.Console("getSafeValueErr", e);
    return defaultValue;
  }
};
