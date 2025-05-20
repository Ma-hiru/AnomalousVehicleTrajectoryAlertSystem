import { createRouter, createMemoryHistory } from "vue-router";
import constantRoutes from "./constantRoutes.ts";
import { beforeEach, onError } from "@/vueRouter/permission.ts";

const router = createRouter({
  history: createMemoryHistory(),
  routes: constantRoutes
});
router.beforeEach(beforeEach);
router.onError(onError);
export default router;
