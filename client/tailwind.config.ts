import { Config } from "tailwindcss";
import daisyui from "daisyui";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,vue}"],
  theme: {
    extend: {}
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["light", "dark", "aqua", "wireframe"]
  }
} as Config;
