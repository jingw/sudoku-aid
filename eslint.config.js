import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
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
    ],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["eslint.config.js"],
        },
      },
    },
    rules: {
      eqeqeq: ["error"],
      "func-style": ["error", "declaration"],
      "no-shadow": ["error"],
      "no-useless-return": ["error"],
      "@typescript-eslint/array-type": ["off"],
      "@typescript-eslint/no-explicit-any": ["off"],
      "@typescript-eslint/no-non-null-assertion": ["off"],
      "@typescript-eslint/explicit-function-return-type": ["error"],
      "@typescript-eslint/no-confusing-void-expression": ["off"],
      "@typescript-eslint/no-unsafe-call": ["off"],
      "@typescript-eslint/no-unsafe-member-access": ["off"],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/non-nullable-type-assertion-style": ["off"],
      "@typescript-eslint/restrict-plus-operands": [
        "error",
        {
          allowNumberAndString: true,
        },
      ],
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowBoolean: true,
        },
      ],
    },
  },
  eslintConfigPrettier,
);
