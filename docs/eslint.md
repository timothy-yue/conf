# ESLint

```js
import { base, react } from "@tim/config/eslint";
```

Both exports are flat-config arrays. Pass them to `defineConfig` in order, and add project overrides after them. Setup is covered in [integration.md](integration.md#2-eslint).

| Export                                            | Purpose                                                      |
| ------------------------------------------------- | ------------------------------------------------------------ |
| `base`                                            | Strict baseline for every project                            |
| `react`                                           | React layer; add after `base`                                |
| `plugin`                                          | The custom rules plugin, also at `@tim/config/eslint-plugin` |
| `TS_FILES`, `JS_FILES`, `SOURCE_FILES`, `IGNORED` | The globs the configs use, for writing matching overrides    |

Formatting is left entirely to Prettier. Neither config enables a formatting rule.

## `base`

Source: [`src/eslint/configs/base.js`](../src/eslint/configs/base.js)

Four parts:

1. **Global ignores**: `node_modules`, `dist`, `build`, `out`, `coverage`, `.next`, `.turbo`, `.vercel`, `*.min.js`.
2. **All source files**: `eslint:recommended` plus the rules below. Unused `eslint-disable` comments are errors.
3. **JavaScript files**: treated as tooling (config files, scripts), so they get Node globals.
4. **TypeScript files**: typescript-eslint's `strictTypeChecked` and `stylisticTypeChecked` presets, with types from the nearest tsconfig (`projectService`).

Every rule is an `error`. There are no warnings: a warning that nobody has to fix is noise.

### Added to `eslint:recommended`

| Group       | Rules                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Correctness | `array-callback-return`, `no-constructor-return`, `no-promise-executor-return`, `no-self-compare`, `no-template-curly-in-string`, `no-unmodified-loop-condition`, `no-unreachable-loop`                                                                                                                                                                                                    |
| Footguns    | `eqeqeq`, `guard-for-in`, `no-alert`, `no-caller`, `no-console` (allows `warn` and `error`), `no-eval`, `no-extend-native`, `no-implicit-coercion`, `no-new-func`, `no-new-wrappers`, `no-param-reassign` (including properties), `no-proto`, `no-return-assign`, `no-sequences`, `no-var`, `radix`                                                                                        |
| Consistency | `curly` (always), `default-case-last`, `no-else-return`, `no-lonely-if`, `no-nested-ternary`, `no-unneeded-ternary`, `no-useless-computed-key`, `no-useless-concat`, `no-useless-rename`, `no-useless-return`, `object-shorthand`, `prefer-arrow-callback`, `prefer-const`, `prefer-object-spread`, `prefer-rest-params`, `prefer-spread`, `prefer-template`, `symbol-description`, `yoda` |

### Added to the typescript-eslint presets

| Rule                                                                                | Why                                                                                                                                           |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `consistent-type-imports`, `consistent-type-exports`, `no-import-type-side-effects` | Types are imported with a top-level `import type`, which pairs with `verbatimModuleSyntax` so no import is left behind at runtime by accident |
| `switch-exhaustiveness-check`                                                       | A new union member breaks the build at every `switch` that forgot it                                                                          |
| `no-shadow`                                                                         | Shadowed names hide bugs                                                                                                                      |
| `prefer-readonly`                                                                   | Private members that never change say so                                                                                                      |
| `promise-function-async`                                                            | A function returning a promise never throws synchronously                                                                                     |
| `require-array-sort-compare`                                                        | No accidental lexicographic sort of numbers (string arrays are exempt)                                                                        |
| `method-signature-style` (`property`)                                               | Property signatures are checked strictly under `strictFunctionTypes`; method signatures are not                                               |
| `default-param-last`, `no-unnecessary-qualifier`, `no-useless-empty-export`         | Tidiness                                                                                                                                      |

### Tuned

| Rule                            | Setting                                                  |
| ------------------------------- | -------------------------------------------------------- |
| `no-unused-vars`                | Names starting with `_` are exempt, as are rest siblings |
| `restrict-template-expressions` | Numbers are allowed in template literals                 |

### Deliberately left out

These are reasonable to enable per project, but too opinionated or too noisy for a shared baseline:

- `@typescript-eslint/strict-boolean-expressions`
- `@typescript-eslint/explicit-module-boundary-types` and `explicit-function-return-type`
- `@typescript-eslint/naming-convention`
- Import ordering (no import plugin is included yet)

## `react`

Source: [`src/eslint/configs/react.js`](../src/eslint/configs/react.js)

| Rule                                                    | Description                                                            |
| ------------------------------------------------------- | ---------------------------------------------------------------------- |
| [`tim/react-import-first`](rules/react-import-first.md) | `import * as React from "react"` must be the first statement. Fixable. |

It applies to every source file, not only `.tsx`: hooks and helpers in `.ts` files import React too, and the rule does nothing in a file without that import.

The layer currently holds only custom rules. `eslint-plugin-react-hooks` and JSX accessibility rules are natural next additions.

## Using a custom rule on its own

```js
import plugin from "@tim/config/eslint-plugin";

export default [
  {
    plugins: { tim: plugin },
    rules: { "tim/react-import-first": "error" },
  },
];
```
