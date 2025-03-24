import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import vue from "eslint-plugin-vue";
import vueConfig from "@vue/eslint-config-standard";
import tseslint from "typescript-eslint";
import prettier from "eslint-plugin-prettier";
import prettierRules from "eslint-config-prettier";
import pluginVitest from "@vitest/eslint-plugin";
import reactCompiler from "eslint-plugin-react-compiler";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    ...pluginVitest.configs.recommended,
    files: ["src/__tests__/**/*"]
  },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "prettier": prettier,
      "react-compiler": reactCompiler
    },
    rules: {
      ...prettierRules.rules,
      ...reactHooks.configs.recommended.rules,
      "react-compiler/react-compiler": "error",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true }
      ],
      "@typescript-eslint/no-explicit-any": "off"
    }
  },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      ...vue.configs["flat/essential"],
      ...vueConfig
    ],
    files: ["**/*.{vue}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser
    },
    plugins: {
      "prettier": prettier
    },
    rules: {
      ...prettierRules.rules,
      "@typescript-eslint/no-explicit-any": "off"
    }
  }
);
