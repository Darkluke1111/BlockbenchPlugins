import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import { defineConfig } from "eslint/config";
import "eslint-plugin-only-warn";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"],
    rules: {
      "semi": [1,"always"],
    },
    languageOptions: { globals: globals.browser }
  },
  tseslint.configs.recommended,
  pluginVue.configs["flat/essential"],
  { 
    files: ["**/*.vue"], 
    languageOptions: { 
      parserOptions: { parser: tseslint.parser } } 
  },
]);
