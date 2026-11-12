import { defineConfig } from "eslint/config";

import plugin from "../../eslint-plugin/index.js";
import { SOURCE_FILES } from "../globs.js";

/**
 * React layer. Add it after `base`.
 *
 * Applies to every source file rather than only `.tsx`: hooks and helpers in
 * plain `.ts` files import React too, and the rules are no-ops elsewhere.
 */
export const react = defineConfig({
  name: "@tim/config/react",
  files: SOURCE_FILES,
  plugins: {
    tim: plugin,
  },
  rules: {
    "tim/react-import-first": "error",
  },
});
