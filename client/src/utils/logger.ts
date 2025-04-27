import dayjs from "dayjs";
import { ElMessage, MessageParams } from "element-plus";

const Console = (...data: any[]) => {
  return console.log(`\x1B[31m${dayjs(new Date()).format("YY-MM-DD hh:mm:ss").toString()}\x1B[0m`, ...data);
};
const Echo = (data: object) => {
  if (data) {
    Object.keys(data).forEach((key) => {
      Console(key, data[key as keyof typeof data]);
    });
  }
};
const Info = (data: string | MessageParams) => {
  if (typeof data === "string") ElMessage.info(data);
  else ElMessage({
    grouping: true,
    type: "info",
    ...data
  } as MessageParams);
};
const Success = (data: string | MessageParams) => {
  if (typeof data === "string") ElMessage.success(data);
  else ElMessage({
    grouping: true,
    type: "success",
    ...data
  } as MessageParams);
};
const Error = (data: string | MessageParams) => {
  if (typeof data === "string") ElMessage.error(data);
  else ElMessage({
    grouping: true,
    type: "error",
    ...data
  } as MessageParams);
};

const Logger = {
  Console,
  Echo,
  Message: {
    Info,
    Success,
    Error
  }
};
export default Logger;
