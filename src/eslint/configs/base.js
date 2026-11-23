import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

import { IGNORED, JS_FILES, SOURCE_FILES, TS_FILES } from "../globs.js";

/**
 * Strict baseline for every project.
 *
 * - All source files: `eslint:recommended` plus a set of correctness and
 *   consistency rules.
 * - TypeScript files: typescript-eslint `strictTypeChecked` and
 *   `stylisticTypeChecked`, with type information from the nearest tsconfig.
 *
 * Formatting is Prettier's job; no formatting rules are enabled here.
 */
export const base = defineConfig(
  globalIgnores(IGNORED, "@tim/config/ignores"),

  {
    name: "@tim/config/base",
    files: SOURCE_FILES,
    extends: [js.configs.recommended],
    linterOptions: {
      reportUnusedDisableDirectives: "error",
      reportUnusedInlineConfigs: "error",
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals["shared-node-browser"],
    },
    rules: {
      // Correctness
      "array-callback-return": ["error", { checkForEach: true }],
      "no-constructor-return": "error",
      "no-promise-executor-return": "error",
      "no-self-compare": "error",
      "no-template-curly-in-string": "error",
      "no-unmodified-loop-condition": "error",
      "no-unreachable-loop": "error",

      // Footguns
      eqeqeq: ["error", "always"],
      "guard-for-in": "error",
      "no-alert": "error",
      "no-caller": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-eval": "error",
      "no-extend-native": "error",
      "no-implicit-coercion": "error",
      "no-new-func": "error",
      "no-new-wrappers": "error",
      "no-param-reassign": ["error", { props: true }],
      "no-proto": "error",
      "no-return-assign": ["error", "always"],
      "no-sequences": "error",
      "no-var": "error",
      radix: "error",

      // Consistency
      curly: ["error", "all"],
      "default-case-last": "error",
      "func-style": ["error", "declaration"],
      "no-else-return": ["error", { allowElseIf: false }],
      "no-lonely-if": "error",
      "no-nested-ternary": "error",
      "no-unneeded-ternary": "error",
      "no-useless-computed-key": "error",
      "no-useless-concat": "error",
      "no-useless-rename": "error",
      "no-useless-return": "error",
      "object-shorthand": ["error", "always"],
      "prefer-arrow-callback": "error",
      "prefer-const": "error",
      "prefer-object-spread": "error",
      "prefer-rest-params": "error",
      "prefer-spread": "error",
      "prefer-template": "error",
      "symbol-description": "error",
      yoda: "error",
    },
  },

  {
    // In a TypeScript project, plain JS files are tooling: configs and scripts.
    name: "@tim/config/base/javascript",
    files: JS_FILES,
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      "no-shadow": "error",
      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
    },
  },

  {
    name: "@tim/config/base/typescript",
    files: TS_FILES,
    extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      // Imports and exports: explicit about what is a type, so that
      // `verbatimModuleSyntax` never leaves a surprise runtime import behind.
      "@typescript-eslint/consistent-type-exports": [
        "error",
        { fixMixedExportsWithInlineTypeSpecifier: false },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",

      // Stricter than the presets
      "@typescript-eslint/default-param-last": "error",
      "@typescript-eslint/method-signature-style": ["error", "property"],
      "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/no-unnecessary-qualifier": "error",
      "@typescript-eslint/no-useless-empty-export": "error",
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/promise-function-async": "error",
      "@typescript-eslint/require-array-sort-compare": ["error", { ignoreStringArrays: true }],
      "@typescript-eslint/switch-exhaustiveness-check": [
        "error",
        { considerDefaultExhaustiveForUnions: true },
      ],

      // Tuned
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
    },
  },
);
