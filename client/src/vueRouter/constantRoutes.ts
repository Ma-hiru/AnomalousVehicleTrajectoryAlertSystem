import { RouteRecordRaw } from "vue-router";

const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "layout",
    component: () => import("@/pages/Layout.vue"),
  }
];
export default constantRoutes;
