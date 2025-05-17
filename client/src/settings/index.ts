import * as API from "@/settings/settings.api";
import * as Theme from "@/settings/settings.theme";
import * as Streams from "@/settings/settings.streams";

const AppSettings = {
  ...API,
  ...Theme,
  ...Streams
};
export default AppSettings;
