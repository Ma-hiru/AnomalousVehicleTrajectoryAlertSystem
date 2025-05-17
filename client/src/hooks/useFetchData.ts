import { fetchData } from "@/utils/fetchData.ts";
import { API } from "@/api";
import { useMemo } from "react";

export const useFetchDataReact = () => {
  return useMemo(() => ({ fetchData, API }), []);
};
export const fetchDataVue = () => {
  return { fetchData, API };
};
