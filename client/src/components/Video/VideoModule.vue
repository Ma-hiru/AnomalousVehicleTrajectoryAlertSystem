<template>
  <VideoForWS
    :url="urlList[index]"
    :meta="item"
    v-for="(item, index) in streamStore.StreamList"
    :active="streamStore.ActiveStream.streamId === item.streamId"
    :key="item.streamId" />
</template>

<script setup lang="ts" name="VideoList">
  import { computed } from "vue";
  import VideoForWS from "@/components/Video/VideoForWS.vue";
  import AppSettings from "@/settings";
  import { useStreamStore } from "@/stores/pinia";

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
