import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["node_modules/", ".netlify/"] },
  js.configs.recommended,
  {
    files: ["public/**/*.js"],
    languageOptions: { sourceType: "module", globals: globals.browser },
  },
  {
    files: ["netlify/**/*.js", "eslint.config.js"],
    languageOptions: { sourceType: "module", globals: globals.node },
  },
];
