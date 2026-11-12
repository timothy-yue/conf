# Prettier

```js
// prettier.config.js
export { default } from "@tim/config/prettier";
```

Source: [`src/prettier/index.js`](../src/prettier/index.js). Setup and overriding are covered in [integration.md](integration.md#4-prettier).

## Options

The config stays close to Prettier's defaults and writes them out, so a change of defaults upstream cannot reformat every project at once.

| Option            | Value       | Default? | Note                                                              |
| ----------------- | ----------- | -------- | ----------------------------------------------------------------- |
| `printWidth`      | `100`       | No (80)  | 80 wraps typed signatures and JSX props too eagerly               |
| `trailingComma`   | `"all"`     | Yes      | Cleaner diffs when a line is added to a list                      |
| `semi`            | `true`      | Yes      |                                                                   |
| `singleQuote`     | `false`     | Yes      | Double quotes in JS and JSX                                       |
| `quoteProps`      | `as-needed` | Yes      |                                                                   |
| `arrowParens`     | `"always"`  | Yes      | `(x) => x`: adding a type or a second parameter is a smaller diff |
| `bracketSpacing`  | `true`      | Yes      |                                                                   |
| `bracketSameLine` | `false`     | Yes      |                                                                   |
| `tabWidth`        | `2`         | Yes      |                                                                   |
| `useTabs`         | `false`     | Yes      |                                                                   |
| `endOfLine`       | `"lf"`      | Yes      | Same bytes on every OS                                            |

One override: Markdown and MDX use `proseWrap: "preserve"`, so paragraphs are never hard-wrapped.

## Plugins

None are bundled, because they depend on the project's stack. Add them in the project:

```js
import shared from "@tim/config/prettier";

/** @type {import("prettier").Config} */
export default {
  ...shared,
  plugins: ["prettier-plugin-tailwindcss"],
};
```

An import-sorting plugin must keep `react` first, or it will conflict with [`tim/react-import-first`](rules/react-import-first.md).

## How it is tested

[`tests/fixtures/prettier/input.tsx`](../tests/fixtures/prettier/input.tsx) is formatted with the shared config and compared with [`expected.tsx`](../tests/fixtures/prettier/expected.tsx). After changing an option on purpose, regenerate the expected file:

```sh
pnpm exec prettier --stdin-filepath input.tsx \
  < tests/fixtures/prettier/input.tsx > tests/fixtures/prettier/expected.tsx
```
