<template>
  <OnEnter mode="FromTop">
    <div class="title-container flex">
      <dv-decoration-10 class="dv-dec-10" />
      <div class="flex justify-center">
        <dv-decoration-8 class="dv-dec-8" :color="decorationColors" />
        <div class="title" @mouseover="setActiveTitle && setActiveTitle(`项目名`)">
          <span class="title-text select-none">
            <OnHover :scale="1.2">
              {{ AppSettings.APP_NAME }}
            </OnHover>
          </span>
          <dv-decoration-6 class="dv-dec-6" :reverse="true" :color="['#50e3c2', '#67a1e5']" />
        </div>
        <dv-decoration-8 class="dv-dec-8" :reverse="true" :color="decorationColors" />
      </div>
      <dv-decoration-10 class="dv-dec-10-s" />
    </div>
  </OnEnter>
</template>

<script setup lang="ts" name="Title">
  import AppSettings from "@/settings";
  import { inject } from "vue";
  import { SetActiveTitle } from "@/ctx/vueKey";
  import OnHover from "@/components/Ani/OnHover.vue";
  import OnEnter from "@/components/Ani/OnEnter.vue";

  const decorationColors = ["#568aea", "#000000"];
  const setActiveTitle = inject(SetActiveTitle);
</script>

<style scoped lang="scss">
  .title-container {
    .dv-dec-10,
    .dv-dec-10-s {
      width: 33.3%;
      height: 5px;
    }

    .dv-dec-10-s {
      transform: rotateY(180deg);
    }

    .dv-dec-8 {
      width: 200px;
      height: 50px;
    }

    .title {
      position: relative;
      width: 500px;
      text-align: center;
      background-size: cover;
      background-repeat: no-repeat;

      .title-text {
        font-size: 30px;
        font-family: title, serif;
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translate(-50%);
      }

      .dv-dec-6 {
        position: absolute;
        bottom: -30px;
        left: 50%;
        width: 250px;
        height: 8px;
        transform: translate(-50%);
      }
    }
  }
</style>
