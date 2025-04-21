import logger from "@/utils/logger";

export const getLocation = async (): Promise<GeolocationPosition | null> => {
  if ("geolocation" in navigator) {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (location) => {
          resolve(location);
        },
        (err) => {
          logger.Message.Error("获取位置失败！");
          logger.Echo({ err });
          resolve(null);
        },
        {
          enableHighAccuracy: false,
          timeout: 20000
        }
      );
    });
  } else {
    logger.Message.Error("浏览器不支持定位！");
    return Promise.resolve(null);
  }
};
