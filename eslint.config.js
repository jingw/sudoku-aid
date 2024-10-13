/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["dist/"],
  },
  ...tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir: import.meta.dirname,
        },
      },
      rules: {
        eqeqeq: ["error"],
        "func-style": ["error", "declaration"],
        "no-shadow": ["error"],
        "no-useless-return": ["error"],
        "sort-imports": ["error"],
        "@typescript-eslint/array-type": ["off"],
        "@typescript-eslint/no-explicit-any": ["off"],
        "@typescript-eslint/no-non-null-assertion": ["off"],
        "@typescript-eslint/explicit-function-return-type": ["error"],
        "@typescript-eslint/no-confusing-void-expression": ["off"],
        "@typescript-eslint/no-unsafe-call": ["off"],
        "@typescript-eslint/no-unsafe-member-access": ["off"],
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
  ),
  eslintConfigPrettier,
];
