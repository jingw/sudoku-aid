import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginQunitRecommended from "eslint-plugin-qunit/configs/recommended";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    ignores: ["dist/"],
  },
  {
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      eslintPluginQunitRecommended,
    ],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["eslint.config.js"],
        },
      },
    },
    rules: {
      eqeqeq: "error",
      "func-style": ["error", "declaration"],
      "no-shadow": "error",
      "no-useless-return": "error",
      "@typescript-eslint/array-type": "off", // ugly for 2D arrays
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-confusing-void-expression": [
        "error",
        { ignoreArrowShorthand: true },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/restrict-plus-operands": ["error", {}], // take defaults instead of strictTypeChecked
      "@typescript-eslint/restrict-template-expressions": ["error", {}],
      "qunit/no-loose-assertions": "error",
    },
  },
  eslintConfigPrettier,
);
