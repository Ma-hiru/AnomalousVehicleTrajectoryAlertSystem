import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import pluginVitest from "@vitest/eslint-plugin";

export default tseslint.config(
  {
    ignores: ["**/dist"]
  },
  {
    files: ["src/__tests__/**/*"],
    plugins: { "@vitest": pluginVitest },
    extends: [pluginVitest.configs.recommended],
    languageOptions: {
      globals: {
        ...pluginVitest.environments.env.globals
      }
    },
    settings: {
      "@vitest": { typecheck: true } // 启用类型测试
    }
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: globals.browser
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
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
  }
);
