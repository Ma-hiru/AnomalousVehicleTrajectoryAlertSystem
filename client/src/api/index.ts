import * as go2rtcAPI from "./moudules/go2rtcAPI";
import * as userAPI from "./moudules/userAPI";

export const API = {
  ...userAPI,
  ...go2rtcAPI
};

