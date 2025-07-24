import { fetchData } from "@/utils/fetchData";
import { API } from "@/api";

const fetcher = {
  fetchData,
  API
};
export const useFetchDataCallback = () => fetcher;
