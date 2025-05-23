import { getLocation } from "@/utils/getLocation";
import logger from "@/utils/logger";
import { useEffect } from "react";
import { useMyState } from "@/hooks/useMyState.ts";

type ReturnType = {
  location: GeolocationPosition | null;
  loading: boolean;
  err: any;
};
export const useLocation = () => {
  const status = useMyState<ReturnType>({
    location: null,
    loading: false,
    err: null
  });
  useEffect(() => {
    status.set((draft) => {
      draft.loading = true;
    });
    getLocation()
      .then((location) => {
        status.set((draft) => {
          draft.location = location;
        });
      })
      .catch((error) => {
        status.set((draft) => {
          draft.err = error;
        });
        logger.Message.Error("获取位置失败！");
      })
      .finally(() => {
        status.set((draft) => {
          draft.loading = false;
        });
      });
  }, [status]);
  return status;
};
