import * as API from "@/settings/settings.api";
import * as Theme from "@/settings/settings.theme";
import * as Streams from "@/settings/settings.streams";
import * as APP from "@/settings/settings.app";

const AppSettings = {
  ...API,
  ...Theme,
  ...Streams,
  ...APP
};
export default AppSettings;
