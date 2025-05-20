/// <reference types="vitest/config" />
import vue from "@vitejs/plugin-vue";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import { defineConfig, loadEnv } from "vite";
import viteCompression from "vite-plugin-compression2";
import VueDevTools from "vite-plugin-vue-devtools";
import crypto from "node:crypto";
import MyViteAliases from "./plugins/MyViteAliases";
import MyHtmlPlugin from "./plugins/MyHtmlPlugin";
import { fileURLToPath } from "node:url";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import Components from "unplugin-vue-components/vite";
import MotionResolver from "motion-v/resolver";

export default defineConfig(({ command, mode }) => {
  console.log("command", command);
  console.log("mode", mode);
  const env = loadEnv(mode, process.cwd(), "VITE_");
  console.log("env", env);
  return {
    base: env.VITE_BASE,
    plugins: [
      nodePolyfills({
        include: ["buffer"]
      }),
      react({
        babel: {
          plugins: [
            ["babel-plugin-react-compiler", {
              target: "19"
            }]
          ]
        }
      }),
      VueDevTools(),
      vue(),
      viteCompression(),
      MyViteAliases({
        prefix: "@",
        baseUrl: fileURLToPath(new URL("./src", import.meta.url))
      }),
      MyHtmlPlugin([
        {
          key: "title",
          val: env.VITE_TITLE
        }
      ]),
      Components({
        dts: true,
        resolvers: [MotionResolver()]
      })
    ],
    css: {
      preprocessorMaxWorkers: true,
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
          additionalData: `@import "@/styles/variable.scss";`
        }
      },
      postcss: {
        plugins: [
          tailwindcss,
          autoprefixer
        ]
      }
    },
    build: {
      rollupOptions: {
        input: {
          main: fileURLToPath(new URL("index.html", import.meta.url))
        },
        output: {
          "manualChunks": (id) => {
            if (id.includes("node_modules"))
              if (id.includes(".pnpm"))
                return crypto.createHash("sha256").update(id.split(".pnpm/")[1].split("/")[0].toString()).digest("hex");
              else
                return crypto.createHash("sha256").update(id.split("node_modules/")[1].split("/")[0].toString()).digest("hex");
          }
        }
      }
    },
    test: {},
    isWatching: false
  };
});
