<template>
  <VideoForWS
    :url="urlList[index]"
    :meta="item"
    v-for="(item, index) in streamStore.StreamList"
    :active="streamStore.ActiveStream.streamId === item.streamId"
    :key="item.streamId"
    :cover="cover[index]"
  />
</template>

<script setup lang="ts" name="VideoList">
  import { computed, ref } from "vue";
  import VideoForWS from "@/components/Video/VideoForWS.vue";
  import AppSettings from "@/settings";
  import { useStreamStore } from "@/stores/pinia/modules/streamStore";
  import cover1 from "/public/mock/cover1.png";
  import cover2 from "/public/mock/cover2.png";
  import cover3 from "/public/mock/cover3.png";


  const cover = ref([cover1, cover2, cover3]);
  const streamStore = useStreamStore();
  const urlList = computed(() => {
    return streamStore.StreamList.reduce(
      (pre, cur) => {
        pre.push(AppSettings.GetStreamURL(cur.streamName));
        return pre;
      },
      [] as { stream: string; frame: string }[]
    );
  });
</script>
<style scoped lang="scss"></style>
