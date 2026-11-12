# Development

How this repo is put together and how to extend it.

## Setup

```sh
pnpm install
pnpm check
```

| Script              | Does                                                 |
| ------------------- | ---------------------------------------------------- |
| `pnpm lint`         | Lints this repo with its own `base` config           |
| `pnpm format`       | Formats with its own Prettier config                 |
| `pnpm format:check` | Verifies formatting                                  |
| `pnpm typecheck`    | Type-checks the JS sources through JSDoc (`checkJs`) |
| `pnpm test`         | Rule unit tests and fixture integration tests        |
| `pnpm check`        | All of the above                                     |

## Principles

- **No build step.** Sources are plain ESM JavaScript with JSDoc types, plus small hand-written `.d.ts` files for the public entry points. What is in the repo is what consumers run, so git and path installs work.
- **The repo uses its own configs.** `eslint.config.js`, `prettier.config.js` and `tsconfig.json` at the root import from `src/` and `tsconfig/`. A rule that is unpleasant to live with shows up here first.
- **Tools are peers.** `eslint`, `typescript` and `prettier` are optional peer dependencies. Plugins and presets that the configs import are regular dependencies, so consumers never install them by hand.

## How it is tested

Two layers, both run by `pnpm test` on Node's built-in test runner.

**Rule unit tests** in `tests/rules/` use ESLint's `RuleTester`, run once with the default parser and once with the TypeScript parser.

**Integration tests** in `tests/integration.test.js` run the real tools against fixture projects:

- `tests/fixtures/react-app` is a pnpm workspace package that depends on `@tim/config` as `workspace:*`. It gets a real `node_modules/@tim/config` link and imports the configs by package name, through `exports`, exactly as an external project does.
  - `src/valid/` must lint clean and be correctly formatted.
  - `src/invalid/` type-checks, but each file must produce a known set of lint errors.
  - `src/typecheck/strictness.ts` proves each strict compiler option is on.
- `tests/fixtures/prettier` is an unformatted input and its expected output.

The root ESLint config ignores `tests/fixtures/`, since fixtures contain errors on purpose and are linted by the tests with their own config.

## Adding a custom rule

1. Create `src/eslint-plugin/rules/<rule-name>.js`, default-exporting a rule object typed as `Rule.RuleModule`. Use `messageId`s, and write a fixer when the fix is unambiguous.
2. Register it in `src/eslint-plugin/index.js`.
3. Enable it in the config it belongs to under `src/eslint/configs/`.
4. Add `tests/rules/<rule-name>.test.js`. Cover the valid cases, the invalid cases with their fixed output, and awkward input: comments, directives, missing trailing newline, CRLF.
5. Add a valid and an invalid file to `tests/fixtures/react-app/src/` and assert on them in `tests/integration.test.js`.
6. Document it in `docs/rules/<rule-name>.md` and list it in `docs/eslint.md`.

[`react-import-first`](../src/eslint-plugin/rules/react-import-first.js) is the reference for all six steps.

## Adding a config layer

For a new ESLint layer (say `node` or `test`):

1. Create `src/eslint/configs/<name>.js` exporting a `defineConfig(...)` array. Give each object a `name` starting with `@tim/config/`, which is what the ESLint config inspector displays.
2. Export it from `src/eslint/index.js` and declare it in `src/eslint/index.d.ts`.
3. Use it from a fixture and assert on the result.
4. Document it in `docs/eslint.md`.

For a new tsconfig preset, add `tsconfig/<name>.json` extending `base.json`, add it to `exports` in `package.json`, and document it in `docs/typescript.md`. The `package` test checks that every `exports` entry resolves from a consumer.

## Adding a fixture project

Create `tests/fixtures/<name>/` with its own `package.json` that depends on `"@tim/config": "workspace:*"`, then run `pnpm install`. The workspace glob `tests/fixtures/*` picks it up. A second fixture is worth it when a setup differs in kind, such as a Node service on `node.json` or a monorepo layout.

## Changing a rule or option

Any change that makes a config stricter can break a consumer's CI, so treat it as a breaking change in the version number. Loosening is a minor change.

## Releasing

Not set up yet. The package has no build step, so a release is a version bump, a tag, and either `pnpm publish` or consumers pointing at the git tag.
