import { Plugin } from "vite";

type options = {
  key: string;
  val: string | number | boolean;
}[];
export default (options: options) =>
  ({
    name: "my-html-title",
    transformIndexHtml: {
      order: "pre",
      handler: (html) => {
        options.forEach((item) => (html = html.replaceAll(`<%= ${item.key} %>`, String(item.val))));
        return html;
      }
    }
  }) as Plugin;
