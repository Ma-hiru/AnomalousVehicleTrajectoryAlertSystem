<template>
  <VideoForWS
    :url="urlList[0]"
    :meta="{ id: i, name: 'ffmpeg' }"
    v-for="i in 10"
    :active="activeId === i"
    :key="i"
    :set-active="
      (id) => {
        activeId = id as number;
      }
    " />
</template>

<script setup lang="ts" name="VideoList">
  import { ref } from "vue";
  import VideoForWS from "@/components/Video/VideoForWS.vue";
  import AppSettings from "@/settings";

  const urlList = ref([AppSettings.GetStreamURL("ffmpeg")]);
  const activeId = ref(1);
</script>

<style scoped lang="scss"></style>
