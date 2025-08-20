import eslint from "@eslint/js";
import prettier from "eslint-config-prettier/flat";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true
      }
    },
    rules: {
      // TODO: Remove explicit `any` usage after adding better tests
      // and using safer types
      "@typescript-eslint/no-explicit-any": "warn",
      // Permit non-null assertions
      "@typescript-eslint/no-non-null-assertion": "off",
      // Permit `_` as a prefix for unused variables
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true
        }
      ]
    }
  },
  prettier,
  {
    ignores: ["dist"]
  }
);
