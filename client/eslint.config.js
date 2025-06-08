import js from "@eslint/js";
import globals from "globals";
import vuePlugin from "eslint-plugin-vue";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettierPlugin from "eslint-plugin-prettier";
import tseslint from "typescript-eslint";
import pluginVitest from "@vitest/eslint-plugin";
import prettierRules from "./.prettierrc.json" with { type: "json" };

export default tseslint.config(
  {
    ignores: ["**/dist/**", "**/node_modules/**"]
  },
  {
    files: ["src/__tests__/**/*"],
    plugins: { "@vitest": pluginVitest },
    extends: [pluginVitest.configs.recommended],
    languageOptions: {
      globals: {
        ...pluginVitest.environments.env.globals,
        ...globals.browser
      }
    },
    settings: {
      "@vitest": { typecheck: true } // 启用类型测试
    }
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: globals.browser
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      prettier: prettierPlugin
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "prettier/prettier": ["warn", prettierRules],
      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true
        }
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-unsafe-function-type": "off"
    }
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{vue}"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.browser
      }
    },
    plugins: {
      vue: vuePlugin,
      prettier: prettierPlugin
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "prettier/prettier": ["warn", prettierRules],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-unsafe-function-type": "off"
    }
  }
);
