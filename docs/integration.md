# Integrating with a project

Everything a consuming project needs, start to finish. Each tool is independent: adopt one, two or all three.

- [1. Install](#1-install)
- [2. ESLint](#2-eslint)
- [3. TypeScript](#3-typescript)
- [4. Prettier](#4-prettier)
- [5. Scripts and CI](#5-scripts-and-ci)
- [Monorepos](#monorepos)
- [Troubleshooting](#troubleshooting)

A complete, working example of all of this lives in [`tests/fixtures/react-app`](../tests/fixtures/react-app). It is linted, type-checked and formatted by this repo's test suite, so it never goes stale.

## 1. Install

The project must be ESM-aware for its config files: either `"type": "module"` in `package.json`, or name the files `eslint.config.mjs` and `prettier.config.mjs`.

Install the config along with the tools you use. They are peer dependencies, so the project controls their versions.

```sh
pnpm add -D @tim/config eslint typescript prettier
```

Where `@tim/config` comes from depends on how you distribute it:

| Source     | Command                                    | Use when                                             |
| ---------- | ------------------------------------------ | ---------------------------------------------------- |
| Registry   | `pnpm add -D @tim/config`                  | Published to npm or a private registry               |
| Git        | `pnpm add -D github:<owner>/<repo>#v0.1.0` | Not published; pin a tag or commit                   |
| Local path | `pnpm add -D link:../config`               | Trying out unreleased changes against a real project |

No build step is involved, so a git install works without a `prepare` script. With `link:`, run `pnpm install` in this repo first, since the linked package resolves its own dependencies from here.

## 2. ESLint

Create `eslint.config.js` at the project root:

```js
import { base, react } from "@tim/config/eslint";
import { defineConfig } from "eslint/config";

export default defineConfig(base, react);
```

Leave out `react` for a project without React.

`base` turns on type-aware linting for TypeScript files. Type information comes from the nearest `tsconfig.json` to each file, so **every linted `.ts`/`.tsx` file must be covered by a tsconfig's `include`**. See [Troubleshooting](#troubleshooting) if it is not.

### Overriding

Add objects after the shared configs. Later entries win.

```js
import { base, react, TS_FILES } from "@tim/config/eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig(
  globalIgnores(["src/generated/**"]),
  base,
  react,
  {
    name: "project/overrides",
    rules: {
      "no-console": "off",
    },
  },
  {
    name: "project/tests",
    files: ["**/*.test.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
);
```

If a rule keeps getting overridden the same way in several projects, change it here instead.

What is in each config: [eslint.md](eslint.md). Custom rules: [rules/](rules).

## 3. TypeScript

Create `tsconfig.json` and extend the preset that matches the environment:

```jsonc
{
  "extends": "@tim/config/tsconfig/react.json",
  "include": ["src"],
}
```

| Preset       | For                                                             |
| ------------ | --------------------------------------------------------------- |
| `base.json`  | Bundled code with no DOM and no JSX (shared libraries, workers) |
| `react.json` | React apps: adds DOM libs and the automatic JSX runtime         |
| `node.json`  | Code Node runs directly: `nodenext` modules and resolution      |

The presets set **compiler options only**. Paths in a tsconfig resolve relative to the file that declares them, so `include`, `exclude`, `paths`, `outDir` and `rootDir` belong in the project's own file.

Common additions:

```jsonc
{
  "extends": "@tim/config/tsconfig/react.json",
  "compilerOptions": {
    "types": ["vite/client"], // ambient types the project needs
    "paths": { "@/*": ["./src/*"] }, // import aliases
  },
  "include": ["src", "vite.config.ts"],
}
```

For Node code, add `@types/node` and `"types": ["node"]`.

The presets set `noEmit`: they are for type-checking, with a bundler producing the output. A project that emits with `tsc` overrides `noEmit` and sets `outDir` itself.

What each option does and why: [typescript.md](typescript.md).

## 4. Prettier

Create `prettier.config.js`:

```js
export { default } from "@tim/config/prettier";
```

Or, with nothing to override, a single line in `package.json` instead of a file:

```json
{ "prettier": "@tim/config/prettier" }
```

To override an option or add a plugin, spread the shared config:

```js
import shared from "@tim/config/prettier";

/** @type {import("prettier").Config} */
export default {
  ...shared,
  plugins: ["prettier-plugin-tailwindcss"],
};
```

Add a `.prettierignore` for generated files. Prettier already skips `node_modules` and anything in `.gitignore`.

ESLint and Prettier do not overlap here: the ESLint configs enable no formatting rules, so `eslint-config-prettier` is not needed.

## 5. Scripts and CI

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit"
  }
}
```

In CI, run `lint`, `format:check` and `typecheck`. Editors need no extra setup beyond their ESLint and Prettier extensions, which pick up the two config files on their own.

## Monorepos

Install `@tim/config` once at the workspace root and keep one root `eslint.config.js` and one root `prettier.config.js`. Both tools apply the root config to every package.

Each package keeps its own `tsconfig.json` extending the preset it needs. ESLint finds the nearest tsconfig per file, so a React app and a Node service can sit side by side:

```
apps/web/tsconfig.json     -> extends @tim/config/tsconfig/react.json
apps/api/tsconfig.json     -> extends @tim/config/tsconfig/node.json
packages/ui/tsconfig.json  -> extends @tim/config/tsconfig/react.json
```

To keep the React rules out of non-React packages, scope them:

```js
export default defineConfig(base, {
  files: ["apps/web/**", "packages/ui/**"],
  extends: [react],
});
```

## Troubleshooting

**`Parsing error: <file> was not found by the project service`**
A TypeScript file is being linted but no tsconfig includes it, typically a root-level `vite.config.ts` or a script. Add it to `include` in `tsconfig.json`. For a stray file that should not join the project, allow it through the default project instead:

```js
{
  languageOptions: {
    parserOptions: {
      projectService: { allowDefaultProject: ["*.config.ts"] },
    },
  },
}
```

**ESLint picks up the wrong tsconfig, or none, when run from another directory**
Pin the root explicitly:

```js
{
  languageOptions: {
    parserOptions: {
      tsconfigRootDir: import.meta.dirname;
    }
  }
}
```

**`Cannot find module '@tim/config/eslint'` or `ERR_REQUIRE_ESM`**
The config file is being loaded as CommonJS. Set `"type": "module"` in `package.json` or rename the file to `.mjs`.

**`File '@tim/config/tsconfig/react.json' not found`**
The package is not installed in a `node_modules` that the project can see, or TypeScript is older than 5.9.

**TypeScript version warning from typescript-eslint**
typescript-eslint supports TypeScript below 6.1. Stay on `typescript@~6.0` until it supports 7.

**The strictness is too much for an existing codebase**
Adopt in stages: Prettier first, then the tsconfig preset with the noisiest options turned off in the project's own `compilerOptions`, then ESLint with temporary rule overrides. Remove the overrides as the code catches up.
