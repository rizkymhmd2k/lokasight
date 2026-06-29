import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: [
      ".astro/**",
      "archive/**",
      "archieveCode/**",
      "build/**",
      "dist/**",
      "node_modules/**",
      "out/**",
    ],
  },
  {
    files: ["**/*.{js,jsx,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
]);
