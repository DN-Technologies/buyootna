const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const simpleImportSort = require("eslint-plugin-simple-import-sort");
const globals = require("globals");

module.exports = defineConfig([
  ...expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    files: ["scripts/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    rules: {
      // 1. STOP the crash by disabling the sorting rule
      "import/order": "off",

      // 2. Disable other rules that check the file system
      "import/no-unresolved": "off",
      "import/namespace": "off",
      "import/default": "off",
      "import/no-duplicates": "off",
      "import/named": "off",
    },
  },
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "import/order": "off", // Turn off the crashing one
      "simple-import-sort/imports": "error", // Turn on the safe one
      "simple-import-sort/exports": "error",
    },
  },
]);
