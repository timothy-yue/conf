/** @import { Config } from "prettier" */

/**
 * Mostly Prettier's defaults, written out so they survive a change of defaults
 * upstream. The deliberate departures are `printWidth` and `trailingComma`.
 *
 * @type {Config}
 */
const config = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  jsxSingleQuote: false,
  quoteProps: "as-needed",
  trailingComma: "all",
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: "always",
  endOfLine: "lf",
  overrides: [
    {
      // Prose wraps in the editor; hard-wrapping it only produces noisy diffs.
      files: ["*.md", "*.mdx"],
      options: { proseWrap: "preserve" },
    },
  ],
};

export default config;
