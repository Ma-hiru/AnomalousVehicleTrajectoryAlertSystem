import { loadEnv, version, Plugin, UserConfig, ConfigEnv } from "vite";

const AsciiArt = (config: UserConfig, configEnv: ConfigEnv) => {
  const styles = [
    `
____   ___.________________________
\\   \\ /   |   \\__    ___\\_   _____/    isSsrBuild ${configEnv.isSsrBuild}
 \\   Y   /|   | |    |   |    __)_     isPreview  ${configEnv.isPreview}
  \\     / |   | |    |   |        \\    command    ${configEnv.command}
   \\___/  |___| |____|  /_______  /    mode       ${configEnv.mode}
                                \\/     version    ${version}
  metaData   ${getMeta()}
             ${getAuthor()}
             ${getUsedPackage()}
  loadedEnv
${getEnvFormat(config, configEnv)}
`
  ];
  console.log(styles[0]);
};
const getMeta = () => {
  let meta = "";
  Object.entries(process.env).forEach(([key, value]) => {
    if (key === "npm_package_name") {
      meta += `${value}`;
    }
    if (key === "npm_package_version") {
      meta += ` v${value}  `;
    }
  });
  return meta;
};
const getAuthor = () => {
  let meta = "";
  Object.entries(process.env).forEach(([key, value]) => {
    if (key === "npm_package_author_name") {
      meta += `${value}`;
    }
    if (key === "npm_package_author_url") {
      meta += `@${value}`;
    }
  });
  return meta;
};
const getUsedPackage = () => {
  return `Vue3+React19+TypeScript`;
};
const getEnvFormat = (config: UserConfig, configEnv: ConfigEnv) => {
  const env = loadEnv(configEnv.mode, process.cwd(), config?.envPrefix || "VITE_");
  let envMap = "";
  let maxKeyLength = 0;
  Object.entries(env).forEach(([key]) => {
    if (key.length > maxKeyLength) {
      maxKeyLength = key.length;
    }
  });
  Object.entries(env).forEach(([key, value]) => {
    envMap += `             - ${padStr(key, maxKeyLength)}  "${value}"\n`;
  });
  return envMap;
};
const padStr = (str: string, len: number) => {
  if (str.length >= len) {
    return str.substring(0, len);
  } else {
    return str + " ".repeat(len - str.length);
  }
};
export default () => {
  return {
    name: "Logger",
    config: AsciiArt
  } satisfies Plugin;
};
