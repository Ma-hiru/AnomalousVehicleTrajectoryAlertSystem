import { getWeather } from "@/utils/getWeather";
import logger from "@/utils/logger";
import { useEffect } from "react";
import { useImmer } from "use-immer";

type ReturnType = {
  weather: WeatherData | null;
  loading: boolean;
  err: any;
};
export const useWeather = () => {
  const [status, setStatus] = useImmer<ReturnType>({
    weather: null,
    loading: false,
    err: null
  });
  useEffect(() => {
    setStatus((draft) => {
      draft.loading = true;
    });
    getWeather()
      .then((weather) => {
        setStatus((draft) => {
          draft.weather = weather;
        });
      })
      .catch((error) => {
        setStatus((draft) => {
          draft.err = error;
        });
        logger.Message.Error("获取天气失败！");
      })
      .finally(() => {
        setStatus((draft) => {
          draft.loading = false;
        });
      });
  }, [setStatus]);
  return status;
};
