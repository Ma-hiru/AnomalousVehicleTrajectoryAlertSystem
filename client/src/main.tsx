/** `React`*/
import "@ant-design/v5-patch-for-react-19";
import { createRoot } from "react-dom/client";
import { setVeauryOptions } from "veaury";

setVeauryOptions({
  react: {
    createRoot
  }
});
/**`Vue`*/
import { createApp } from "vue";
import AppVue from "./App.vue";

const app = createApp(AppVue);
//element-plus
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import zhCn from "element-plus/es/locale/lang/zh-cn";
// import "element-plus/theme-chalk/dark/css-vars.css";
app.use(ElementPlus, {
  locale: zhCn
});

//pinia
import { pinia } from "./stores/pinia";

app.use(pinia);
//vue-vueRouter
import router from "./vueRouter";

app.use(router);
//scss
import "./styles/index.scss";

//DataV
import DataVVue3 from "@kjgl77/datav-vue3";

//WebAssembly
import init from "@/wasm/pkg";

init()
  .then((res) => {
    console.log("WebAssembly init success\n", res);
  })
  .catch(() => {
    console.error("WebAssembly init failed");
  });

app.use(DataVVue3);

app.mount("#app");
