import { mergeConfig, defineConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default defineConfig((configEnv) => mergeConfig(
  viteConfig(configEnv),
  defineConfig({
    test: {
      name: "vitest-template",
      include: ["src/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
      environment: "jsdom",
      globals: true,
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "./playground/**/*.*",
        "./playground-temp/**/*.*"
      ],
      setupFiles: ["src/__tests__/index.ts"],
      watch: configEnv.mode === "development"
    }
  })
));

