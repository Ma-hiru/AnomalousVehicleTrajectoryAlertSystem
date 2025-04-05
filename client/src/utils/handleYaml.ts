import jsyaml from "js-yaml";
import { omitBy } from "lodash-es";

export const JsonToYaml = (json: Record<string, any>) => {
  try {
    console.log(json);
    const newJson = omitBy(json, v => v === "" || v === null || v === undefined);
    console.log(newJson);
    return jsyaml.dump(newJson, {
      replacer: (_, value) => (value === "" ? null : value),
      skipInvalid: true,
      indent: 2,
      noCompatMode: true
    });
  } catch (e) {
    console.log(e);
    return "";
  }
};
export const YamlToJson = (yaml: string): Go2rtcConfigYaml => {
  try {
    return {
      data: jsyaml.load(yaml) as any,
      content: yaml
    };
  } catch (e) {
    console.log(e);
    return {
      content: yaml,
      data: {}
    };
  }
};
