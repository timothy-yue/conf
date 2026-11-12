/** @import { ESLint } from "eslint" */

import reactImportFirst from "./rules/react-import-first.js";

/**
 * Custom rules. Registered under the `tim` namespace by the shared configs,
 * e.g. `tim/react-import-first`.
 *
 * @type {ESLint.Plugin}
 */
const plugin = {
  meta: {
    name: "@tim/config/eslint-plugin",
  },
  rules: {
    "react-import-first": reactImportFirst,
  },
};

export default plugin;
