import { getWeather } from "@/utils/getWeather";
import logger from "@/utils/logger";
import { useEffect } from "react";
import { useMyState } from "@/hooks/useMyState.ts";

type ReturnType = {
  weather: WeatherData | null;
  loading: boolean;
  err: any;
};
export const useWeather = () => {
  const status = useMyState<ReturnType>({
    weather: null,
    loading: false,
    err: null
  });
  useEffect(() => {
    status.set(draft => {
      draft.loading = true;
    });
    getWeather()
      .then((weather) => {
        status.set(draft => {
          draft.weather = weather;
        });
      })
      .catch((error) => {
        status.set(draft => {
          draft.err = error;
        });
        logger.Message.Error("获取天气失败！");
      })
      .finally(() => {
        status.set(draft => {
          draft.loading = false;
        });
      });
  }, [status]);
  return status;
};
