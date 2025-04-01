import jsyaml from "js-yaml";

export const JsonToYaml = (json: Record<string, any>) => {
  try {
    return jsyaml.dump(json, { quotingType: "\"" });
  } catch (e) {
    console.log(e);
    return "";
  }
};
export const YamlToJson = (yaml: string) => {
  try {
    return {
      data: jsyaml.load(yaml),
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
