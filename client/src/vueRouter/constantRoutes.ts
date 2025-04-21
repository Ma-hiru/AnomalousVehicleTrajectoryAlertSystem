import { RouteRecordRaw } from "vue-router";

const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "layout",
    component: () => import("@/pages/Layout.vue"),
    meta: {
      title: ""
    },
    redirect: "/analysis",
    children: [
      {
        path: "/analysis",
        name: "analysis",
        meta: {
          title: "实时数据"
        },
        component: () => import("@/pages/Analysis.vue")
      },
      {
        path: "/track",
        name: "track",
        meta: {
          title: "轨迹追踪"
        },
        component: () => import("@/pages/Track.vue")
      },
      {
        path: "/settings",
        name: "settings",
        meta: {
          title: "设置"
        },
        component: () => import("@/pages/Settings.vue")
      }
    ]
  }
];
export default constantRoutes;
