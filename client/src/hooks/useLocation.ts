import { getLocation } from "@/utils/getLocation";
import logger from "@/utils/logger";
import { useEffect } from "react";
import { useImmer } from "use-immer";

type ReturnType = {
  location: GeolocationPosition | null;
  loading: boolean;
  err: any;
};
export const useLocation = () => {
  const [status, setStatus] = useImmer<ReturnType>({
    location: null,
    loading: false,
    err: null
  });
  useEffect(() => {
    setStatus((draft) => {
      draft.loading = true;
    });
    getLocation()
      .then((location) => {
        setStatus((draft) => {
          draft.location = location;
        });
      })
      .catch((error) => {
        setStatus((draft) => {
          draft.err = error;
        });
        logger.Message.Error("获取位置失败！");
      })
      .finally(() => {
        setStatus((draft) => {
          draft.loading = false;
        });
      });
  }, [setStatus]);
  return status;
};
