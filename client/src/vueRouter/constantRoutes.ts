import { RouteRecordRaw } from "vue-router";

const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "layout",
    component: () => import("@/pages/layout/Layout.vue"),
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
        component: () => import("@/pages/layout/analysis/Analysis.vue")
      },
      {
        path: "/track",
        name: "track",
        meta: {
          title: "轨迹追踪"
        },
        component: () => import("@/pages/layout/track/Track.vue")
      },
      {
        path: "/settings",
        name: "settings",
        meta: {
          title: "设置"
        },
        component: () => import("@/pages/layout/settings/Settings.vue")
      }
    ]
  }
];
export default constantRoutes;
