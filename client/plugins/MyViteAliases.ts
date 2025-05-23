import { UserConfig, Plugin } from "vite";
import * as fs from "node:fs";
import path from "node:path";

type options = {
  prefix: string;
  baseUrl: string;
};
const getAliases = (prefix: string, baseUrl: string): Record<string, string> => {
  const alias: Record<string, string> = {};
  alias[prefix] = baseUrl;
  fs.readdirSync(baseUrl).forEach((name) => {
    if (fs.statSync(path.resolve(baseUrl, name)).isDirectory())
      alias[`${prefix}${name}`] = path.resolve(baseUrl, name);
  });
  return alias;
};
export default (options: options) =>
  ({
    name: "my-vite-aliases",
    config: (config: UserConfig): UserConfig | null | void => {
      const alias = getAliases(options.prefix, options.baseUrl);
      console.log("alias", alias);
      return {
        resolve: {
          alias: {
            ...config?.resolve?.alias,
            ...alias
          }
        }
      };
    }
  }) as Plugin;
