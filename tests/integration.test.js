import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { describe, it } from "node:test";
import { promisify } from "node:util";

import { ESLint } from "eslint";
import * as prettier from "prettier";

const execFileAsync = promisify(execFile);

const fixtures = path.join(import.meta.dirname, "fixtures");
const reactApp = path.join(fixtures, "react-app");

/**
 * Lints files in the fixture project exactly as `eslint` run from its root
 * would: its own eslint.config.js, resolving `@tim/config` from node_modules.
 *
 * @param {string[]} patterns
 * @param {ESLint.Options} [options]
 */
async function lintFixture(patterns, options) {
  const eslint = new ESLint({ cwd: reactApp, ...options });
  return eslint.lintFiles(patterns);
}

/**
 * @param {ESLint.LintResult[]} results
 * @param {string} fileName
 */
function ruleIdsFor(results, fileName) {
  const result = results.find((candidate) => path.basename(candidate.filePath) === fileName);
  assert.ok(result, `no lint result for ${fileName}`);
  return result.messages.map((message) => message.ruleId);
}

describe("fixture: react-app", () => {
  describe("eslint", () => {
    it("passes valid sources cleanly", async () => {
      const results = await lintFixture(["src/valid"]);

      assert.equal(results.length, 3);
      for (const result of results) {
        assert.deepEqual(result.messages, [], `unexpected messages in ${result.filePath}`);
      }
    });

    it("reports a React namespace import that is not first", async () => {
      const results = await lintFixture(["src/invalid/react-import-not-first.tsx"]);

      assert.deepEqual(ruleIdsFor(results, "react-import-not-first.tsx"), [
        "tim/react-import-first",
      ]);
    });

    it("fixes the React import position", async () => {
      const [result] = await lintFixture(["src/invalid/react-import-not-first.tsx"], {
        fix: true,
      });

      assert.ok(result);
      assert.deepEqual(result.messages, []);
      assert.match(
        result.output ?? "",
        /^import \* as React from "react";\nimport \{ Button \} from "\.\.\/valid\/Button";\n/,
      );
    });

    it("reports loose code through core and type-aware rules", async () => {
      const results = await lintFixture(["src/invalid/loose.ts"]);
      const ruleIds = new Set(ruleIdsFor(results, "loose.ts"));

      for (const expected of [
        "no-var",
        "eqeqeq",
        "curly",
        "@typescript-eslint/no-explicit-any",
        "@typescript-eslint/no-unsafe-assignment",
      ]) {
        assert.ok(ruleIds.has(expected), `expected ${expected}, got ${[...ruleIds].join(", ")}`);
      }
    });

    it("reports function expressions bound to names and as callbacks", async () => {
      const results = await lintFixture(["src/invalid/function-style.ts"]);

      assert.deepEqual(ruleIdsFor(results, "function-style.ts"), [
        "func-style",
        "func-style",
        "prefer-arrow-callback",
      ]);
    });
  });

  describe("typescript", () => {
    it("type-checks against the shared tsconfig with every strict option on", async () => {
      // Resolved from the fixture, so this is the compiler a consumer would run.
      const tsc = createRequire(path.join(reactApp, "package.json")).resolve("typescript/bin/tsc");

      await assert.doesNotReject(
        execFileAsync(process.execPath, [tsc, "--noEmit", "--pretty", "false"], { cwd: reactApp }),
      );
    });
  });

  describe("prettier", () => {
    it("resolves the shared config from the consumer's prettier.config.js", async () => {
      const resolved = await prettier.resolveConfig(path.join(reactApp, "src/valid/Button.tsx"));
      const { default: shared } = await import("../src/prettier/index.js");
      const { overrides: _overrides, ...options } = shared;

      assert.deepEqual(resolved, options);
    });

    it("leaves fixture sources that are already formatted untouched", async () => {
      for (const file of ["src/valid/Button.tsx", "src/valid/ClientCounter.tsx"]) {
        const filepath = path.join(reactApp, file);
        const source = await readFile(filepath, "utf8");
        const options = await prettier.resolveConfig(filepath);

        assert.equal(await prettier.check(source, { ...options, filepath }), true, file);
      }
    });
  });
});

describe("fixture: prettier", () => {
  it("formats input.tsx into expected.tsx", async () => {
    const { default: shared } = await import("../src/prettier/index.js");
    const input = await readFile(path.join(fixtures, "prettier/input.tsx"), "utf8");
    const expected = await readFile(path.join(fixtures, "prettier/expected.tsx"), "utf8");

    assert.equal(await prettier.format(input, { ...shared, filepath: "input.tsx" }), expected);
  });
});

describe("package", () => {
  it("exposes every documented entry point", async () => {
    const pkg = JSON.parse(
      await readFile(path.join(import.meta.dirname, "../package.json"), "utf8"),
    );
    const fromFixture = createRequire(path.join(reactApp, "package.json"));

    for (const entry of Object.keys(pkg.exports)) {
      assert.doesNotThrow(
        () => fromFixture.resolve(path.posix.join(pkg.name, entry)),
        `${entry} does not resolve from a consumer`,
      );
    }
  });
});
