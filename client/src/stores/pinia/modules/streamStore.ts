import { defineStore } from "pinia";
import { ref } from "vue";
// import { fetchDataVue } from "@/hooks/useFetchData.ts";

// const { fetchData, API } = fetchDataVue();
export const useStreamStore = defineStore("streamStore", () => {
  const streamList = ref([]);
  const activeStream = ref();

  return {
    streamList,
    activeStream
  };
});
