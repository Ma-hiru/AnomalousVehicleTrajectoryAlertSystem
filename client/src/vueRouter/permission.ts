import { type Router } from "vue-router";
import Logger from "@/utils/logger.ts";

type beforeEach = Parameters<Router["beforeEach"]>[number];
type onError = Parameters<Router["onError"]>[number];
export const beforeEach: beforeEach = () => {};
export const onError: onError = () => {
  Logger.Message.Error("页面加载失败！");
};
