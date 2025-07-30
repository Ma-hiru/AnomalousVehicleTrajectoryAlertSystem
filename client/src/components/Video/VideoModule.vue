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
  import { useStreamStore } from "@/stores/pinia";
  import { GetStreamSource } from "@/utils/getStreamSource";

  const streamStore = useStreamStore();
  const urlList = computed(() => {
    return GetStreamSource(streamStore.StreamList);
  });
</script>
<style scoped lang="scss"></style>
