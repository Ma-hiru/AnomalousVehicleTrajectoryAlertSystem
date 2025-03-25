<template>
  <div class="bg-gray-200 grid grid-cols-2 justify-items-center items-center"
       :style="styles.container">
    <Video :width="styles.videoItem.width"
           :url="urlList[0]"
           :meta="{id:i,name:'test'+i}"
           v-for="i in 8"
           :key="i"
    />
  </div>
</template>

<script setup lang="ts" name='VideoList'>
import { CSSProperties } from "react";
import Video from "@/components/vue/Video.vue";
import { ref } from "vue";

const props = defineProps<{
  containerStyle: CSSProperties
}>();
//
const urlList = ref(["ws://127.0.0.1:8080/api/go2rtc/ws?src=ffmpeg"]);
// const metaList = ref([{ id: 1, name: "test" }]);
const styles = {
  container: {
    ...props.containerStyle
  },
  videoItem: {
    width: "95%"
  }
};
</script>

<style scoped lang="scss">

</style>
