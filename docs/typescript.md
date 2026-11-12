# TypeScript

Three presets, each a `tsconfig.json` to `extends`. Setup is covered in [integration.md](integration.md#3-typescript).

| Preset                                 | Extends | Adds                                                 |
| -------------------------------------- | ------- | ---------------------------------------------------- |
| [`base.json`](../tsconfig/base.json)   |         | Everything below                                     |
| [`react.json`](../tsconfig/react.json) | `base`  | `lib: [ES2024, DOM, DOM.Iterable]`, `jsx: react-jsx` |
| [`node.json`](../tsconfig/node.json)   | `base`  | `module` and `moduleResolution`: `nodenext`          |

The presets contain compiler options only. `include`, `exclude`, `paths` and output directories resolve relative to the file that declares them, so they belong in each project.

## The model

The presets assume the modern split of responsibilities: **TypeScript checks types, something else produces JavaScript** (Vite, esbuild, swc, Next.js, or Node's own type stripping). That is why `noEmit` is on, and why the options below insist that every file can be transpiled alone, without type information.

## `base.json`

### Language and modules

| Option                         | Value      | Effect                                                                                       |
| ------------------------------ | ---------- | -------------------------------------------------------------------------------------------- |
| `target`, `lib`                | `ES2024`   | Modern syntax and built-ins. No DOM: the environment is chosen by the preset or the project. |
| `module`                       | `preserve` | Imports and exports are left exactly as written for the bundler.                             |
| `moduleResolution`             | `bundler`  | Resolves like a bundler: `exports` maps, no mandatory file extensions.                       |
| `moduleDetection`              | `force`    | Every file is a module, so two scripts cannot collide on a global name.                      |
| `resolveJsonModule`            | `true`     | JSON imports are typed.                                                                      |
| `noUncheckedSideEffectImports` | `true`     | `import "./missing.css"` is an error instead of being silently ignored.                      |

### Single-file transpilation

| Option                 | Effect                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| `verbatimModuleSyntax` | Imports are emitted as written. Anything that is only a type must say `import type`.                          |
| `isolatedModules`      | Rejects code that cannot be compiled one file at a time.                                                      |
| `erasableSyntaxOnly`   | Rejects TypeScript syntax that generates runtime code: `enum`, `namespace`, constructor parameter properties. |

In place of an `enum`, use a union of string literals or an `as const` object.

### Strictness

| Option                                      | What it catches                                                                   |
| ------------------------------------------- | --------------------------------------------------------------------------------- |
| `strict`                                    | The standard strict family: `strictNullChecks`, `noImplicitAny` and the rest.     |
| `noUncheckedIndexedAccess`                  | `array[i]` and `record[key]` are `T \| undefined`, because they can be.           |
| `exactOptionalPropertyTypes`                | `{ a?: string }` does not accept `{ a: undefined }`. Absent and undefined differ. |
| `noPropertyAccessFromIndexSignature`        | Keys from an index signature need `obj["key"]`, marking them as unchecked.        |
| `noImplicitOverride`                        | Overriding a base-class member requires the `override` keyword.                   |
| `noImplicitReturns`                         | Every code path returns.                                                          |
| `noFallthroughCasesInSwitch`                | No accidental `case` fallthrough.                                                 |
| `noUnusedLocals`, `noUnusedParameters`      | Dead bindings are errors. Prefix a name with `_` to keep it deliberately.         |
| `allowUnreachableCode`, `allowUnusedLabels` | Set to `false`: errors instead of editor hints.                                   |
| `forceConsistentCasingInFileNames`          | Import casing must match the file, so macOS and Linux agree.                      |

### Output

| Option         | Value  | Effect                                                                                            |
| -------------- | ------ | ------------------------------------------------------------------------------------------------- |
| `noEmit`       | `true` | Type-check only.                                                                                  |
| `skipLibCheck` | `true` | Does not re-check `.d.ts` files from dependencies. Faster, and their errors are not yours to fix. |

## Loosening an option

Override it in the project's `compilerOptions`. The two that most often need this while migrating existing code are `exactOptionalPropertyTypes` and `noPropertyAccessFromIndexSignature`.

```jsonc
{
  "extends": "@tim/config/tsconfig/react.json",
  "compilerOptions": {
    "exactOptionalPropertyTypes": false,
  },
  "include": ["src"],
}
```

## Emitting with `tsc`

For a library built by `tsc` itself, extend `node.json` and turn emit back on:

```jsonc
{
  "extends": "@tim/config/tsconfig/node.json",
  "compilerOptions": {
    "noEmit": false,
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "sourceMap": true,
  },
  "include": ["src"],
}
```

## How the presets are tested

[`tests/fixtures/react-app/src/typecheck/strictness.ts`](../tests/fixtures/react-app/src/typecheck/strictness.ts) holds one `@ts-expect-error` per strict option. If a preset loses an option, the directive goes unused and `tsc` fails, which fails the integration test.
