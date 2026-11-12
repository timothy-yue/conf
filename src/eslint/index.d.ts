import type { ESLint, Linter } from "eslint";

/** Strict baseline: `eslint:recommended` + typescript-eslint strict, type-checked. */
export declare const base: Linter.Config[];

/** React layer: custom React rules. Add after `base`. */
export declare const react: Linter.Config[];

/** The custom rules plugin, registered by the configs as `tim`. */
export declare const plugin: ESLint.Plugin;

export declare const TS_FILES: string[];
export declare const JS_FILES: string[];
export declare const SOURCE_FILES: string[];
export declare const IGNORED: string[];

declare const configs: {
  base: Linter.Config[];
  react: Linter.Config[];
};

export default configs;
