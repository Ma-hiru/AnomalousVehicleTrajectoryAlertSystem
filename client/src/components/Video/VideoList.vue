<template>
  <div class="list-container">
    <VideoForWS
      class="w-[250px]"
      :url="urlList[0]"
      :meta="{ id: i, name: 'ffmpeg' }"
      v-for="i in 2"
      :active="activeId === i"
      :key="i"
      :set-active="
        (id) => {
          activeId = id as number;
        }
      " />
  </div>
</template>

<script setup lang="ts" name="VideoList">
  import { ref } from "vue";
  import VideoForWS from "@/components/Video/VideoForWS.vue";
  import AppSettings from "@/settings";

  const urlList = ref([AppSettings.GetStreamURL("ffmpeg")]);
  const activeId = ref(1);
</script>

<style scoped lang="scss">
  .list-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    overflow-x: hidden;
    scrollbar-width: none;
    gap: 10px;
    padding: 10px 0;
  }
</style>
