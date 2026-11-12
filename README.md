# @tim/config

Shared frontend configuration, kept in one place and consumed by every project:

| What                | Entry point                                    | Docs                                     |
| ------------------- | ---------------------------------------------- | ---------------------------------------- |
| ESLint configs      | `@tim/config/eslint` (`base`, `react`)         | [docs/eslint.md](docs/eslint.md)         |
| Custom ESLint rules | `@tim/config/eslint-plugin` (namespace `tim/`) | [docs/rules](docs/rules)                 |
| TypeScript presets  | `@tim/config/tsconfig/{base,react,node}.json`  | [docs/typescript.md](docs/typescript.md) |
| Prettier config     | `@tim/config/prettier`                         | [docs/prettier.md](docs/prettier.md)     |

There is no build step: the package ships plain ESM and JSON, so it works the same from a registry, a git URL or a local path.

## Quick start

```sh
pnpm add -D @tim/config eslint typescript prettier
```

```js
// eslint.config.js
import { base, react } from "@tim/config/eslint";
import { defineConfig } from "eslint/config";

export default defineConfig(base, react);
```

```js
// prettier.config.js
export { default } from "@tim/config/prettier";
```

```jsonc
// tsconfig.json
{
  "extends": "@tim/config/tsconfig/react.json",
  "include": ["src"],
}
```

The full guide, including install options, overrides, monorepos and troubleshooting, is in **[docs/integration.md](docs/integration.md)**.

## Requirements

| Tool       | Version      | Note                                                  |
| ---------- | ------------ | ----------------------------------------------------- |
| Node       | `>=20.19`    |                                                       |
| ESLint     | `^10`        | Flat config only                                      |
| TypeScript | `>=5.9 <6.1` | TypeScript 7 waits on typescript-eslint supporting it |
| Prettier   | `^3.6`       |                                                       |

All three tools are optional peers: install only the ones whose config you use.

## Repository layout

```
src/
  eslint/                 ESLint configs
    configs/base.js         strict baseline (JS + type-checked TS)
    configs/react.js        React layer
    globs.js                shared file globs and ignores
    index.js                public entry: @tim/config/eslint
  eslint-plugin/          custom rules
    rules/                  one file per rule
    index.js                public entry: @tim/config/eslint-plugin
  prettier/index.js       public entry: @tim/config/prettier
tsconfig/                 base.json, react.json, node.json
tests/
  rules/                  unit tests per rule (ESLint RuleTester)
  integration.test.js     runs ESLint, tsc and Prettier against the fixtures
  fixtures/
    react-app/              a consumer project, installed as a workspace package
    prettier/               input.tsx -> expected.tsx
docs/                     guides and one page per custom rule
```

## Development

```sh
pnpm install
pnpm check     # lint + format:check + typecheck + test
```

See [docs/development.md](docs/development.md) for how to add a rule, a config layer or a fixture.

> The package name `@tim/config` and the rule namespace `tim/` are placeholders chosen at scaffold time. To rename, search and replace `@tim/` and `tim/` across the repo, then run `pnpm install && pnpm check`.
