<template>
  <OnEnter mode="FromBottom">
    <div class="menu-container flex justify-between">
      <div class="flex aside-width">
        <div class="react-left ml-4 react-l-s">
          <span class="react-before" />
          <span class="text" @mouseover="setActiveTitle && setActiveTitle('时间')">
            {{ timeInfo.dateYear }}
            {{ timeInfo.dateWeek }}
            {{ timeInfo.dateDay }}
          </span>
        </div>
        <div class="react-left ml-3">
          <OnHover :scale="1.2">
            <motion.span class="text" ref="titleScope" :initial="{ opacity: 0 }">
              {{ realTitle }}
            </motion.span>
          </OnHover>
        </div>
      </div>
      <div class="flex aside-width">
        <div class="react-right bg-[#0E369999] mr-3">
          <span
            class="text text-base font-bold"
            @mouseover="setActiveTitle && setActiveTitle('项目名')">
            <OnHover :scale="1.15">
              {{ AppSettings.APP_NAME_SUB }}
            </OnHover>
          </span>
        </div>
        <div class="react-right mr-4 react-l-s">
          <span class="react-after" />
          <span class="text">
            <BarMenuReact :setActiveTitle="setActiveTitle" />
          </span>
        </div>
      </div>
    </div>
  </OnEnter>
</template>

<script setup lang="ts" name="Menu">
  import AppSettings from "@/settings";
  import { inject, onMounted, onUnmounted, reactive, ref, watch } from "vue";
  import dayjs from "dayjs";
  import { applyPureReactInVue } from "veaury";
  import BarMenu from "@/components/TopBar/BarMenu";
  import OnEnter from "@/components/Ani/OnEnter.vue";
  import { ActiveTitle, SetActiveTitle } from "@/ctx/vueKey";
  import { motion, useAnimate } from "motion-v";
  import OnHover from "@/components/Ani/OnHover.vue";

  const BarMenuReact = applyPureReactInVue(BarMenu);
  /** time */
  const timeInfo = reactive({
    setInterval: 0 as unknown as NodeJS.Timeout,
    dateDay: "",
    dateYear: "",
    dateWeek: ""
  });
  onMounted(() => {
    handleTime();
    timeInfo.setInterval = setInterval(handleTime, 1000);
  });
  onUnmounted(() => {
    clearInterval(timeInfo.setInterval);
  });
  const handleTime = () => {
    const date = new Date();
    timeInfo.dateDay = dayjs(date).format("HH: mm: ss");
    timeInfo.dateYear = dayjs(date).format("YYYY-MM-DD");
    timeInfo.dateWeek = AppSettings.WEEK[date.getDay()];
  };
  /** title */
  const realTitle = ref("");
  const title = inject(ActiveTitle);
  const setActiveTitle = inject(SetActiveTitle);
  /** animate */
  const [titleScope, titleAnimate] = useAnimate();
  if (title !== undefined) {
    watch(title, async () => {
      await titleAnimate(titleScope.value, { opacity: 0 }, { duration: 0.5 });
      realTitle.value = title.value;
      await titleAnimate(titleScope.value, { opacity: 1 }, { duration: 0.5 });
    });
  }
</script>

<style scoped lang="scss">
  .menu-container {
    .aside-width {
      width: 40%;
    }

    .react-r-s,
    .react-l-s {
      background-color: #0f1325;
    }

    .react-right {
      &.react-l-s {
        text-align: right;
        width: 500px;
      }

      font-size: 18px;
      width: 300px;
      line-height: 50px;
      text-align: center;
      transform: skewX(-45deg);

      .react-after {
        position: absolute;
        right: -25px;
        top: 0;
        height: 50px;
        width: 50px;
        background-color: #0f1325;
        transform: skewX(45deg);
      }

      .text {
        display: inline-block;
        user-select: none;
        transform: skewX(45deg);
        font-family: title, serif;
        font-size: 18px;
      }
    }

    .react-left {
      &.react-l-s {
        width: 500px;
        text-align: left;
      }

      font-size: 18px;
      width: 300px;
      height: 50px;
      line-height: 50px;
      text-align: center;
      transform: skewX(45deg);
      background-color: #0f1325;

      .react-before {
        position: absolute;
        left: -25px;
        top: 0;
        height: 50px;
        width: 50px;
        background-color: #0f1325;
        transform: skewX(-45deg);
      }

      .text {
        display: inline-block;
        user-select: none;
        transform: skewX(-45deg);
        font-family: title, serif;
        font-size: 20px;
      }
    }
  }
</style>
