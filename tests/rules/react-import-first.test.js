import { describe, it } from "node:test";

import { RuleTester } from "eslint";
import tseslint from "typescript-eslint";

import rule from "../../src/eslint-plugin/rules/react-import-first.js";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const errors = [{ messageId: "notFirst" }];

/** @param {string[]} lines */
function code(...lines) {
  return lines.join("\n");
}

const valid = [
  {
    name: "namespace import is the first statement",
    code: code('import * as React from "react";', 'import { helper } from "./helper";'),
  },
  {
    name: "file does not import React at all",
    code: code('import { helper } from "./helper";', "helper();"),
  },
  {
    name: "other import styles from react are not this rule's concern",
    code: code('import { helper } from "./helper";', 'import { useState } from "react";'),
  },
  {
    name: "default import from react is not this rule's concern",
    code: code('import { helper } from "./helper";', 'import React from "react";'),
  },
  {
    name: "directives may precede the import",
    code: code('"use client";', "", 'import * as React from "react";', 'import "./styles.css";'),
  },
  {
    name: "comments may precede the import",
    code: code("/* licence header */", "// note", 'import * as React from "react";'),
  },
  {
    name: "namespace import from another module is ignored",
    code: code('import * as path from "node:path";', 'import * as React from "react-dom";'),
  },
];

const invalid = [
  {
    name: "another import comes first",
    code: code(
      'import { helper } from "./helper";',
      'import * as React from "react";',
      "helper();",
    ),
    output: code(
      'import * as React from "react";',
      'import { helper } from "./helper";',
      "helper();",
    ),
    errors,
  },
  {
    name: "moved above every other import, keeping their order",
    code: code(
      'import a from "a";',
      'import b from "b";',
      "",
      'import * as React from "react";',
      'import c from "c";',
    ),
    output: code(
      'import * as React from "react";',
      'import a from "a";',
      'import b from "b";',
      "",
      'import c from "c";',
    ),
    errors,
  },
  {
    name: "moved below directives, not above them",
    code: code('"use client";', 'import a from "a";', 'import * as React from "react";'),
    output: code('"use client";', 'import * as React from "react";', 'import a from "a";'),
    errors,
  },
  {
    name: "moved below a leading comment, not above it",
    code: code("/* licence header */", 'import a from "a";', 'import * as React from "react";'),
    output: code("/* licence header */", 'import * as React from "react";', 'import a from "a";'),
    errors,
  },
  {
    name: "a side-effect import comes first",
    code: code('import "./polyfill";', 'import * as React from "react";'),
    output: code('import * as React from "react";', 'import "./polyfill";'),
    errors,
  },
  {
    name: "a non-import statement comes first",
    code: code("const answer = 42;", 'import * as React from "react";', "export { answer };"),
    output: code('import * as React from "react";', "const answer = 42;", "export { answer };"),
    errors,
  },
  {
    name: "shares a line with another statement",
    code: 'import a from "a"; import * as React from "react";',
    output: code('import * as React from "react";', 'import a from "a"; '),
    errors,
  },
  {
    name: "Windows line endings are removed with the import",
    code: 'import a from "a";\r\nimport * as React from "react";\r\nexport { a };',
    output: 'import * as React from "react";\nimport a from "a";\r\nexport { a };',
    errors,
  },
];

describe("react-import-first", () => {
  describe("default parser", () => {
    new RuleTester().run("react-import-first", rule, { valid, invalid });
  });

  describe("typescript parser", () => {
    const ruleTester = new RuleTester({
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: { ecmaFeatures: { jsx: true } },
      },
    });

    ruleTester.run("react-import-first", rule, {
      valid: [
        ...valid,
        {
          name: "type-only namespace import is first",
          code: code('import type * as React from "react";', 'import a from "a";'),
        },
        {
          name: "tsx component",
          code: code(
            'import * as React from "react";',
            "export const App = (): React.JSX.Element => <main />;",
          ),
        },
      ],
      invalid: [
        ...invalid,
        {
          name: "type-only namespace import is not first",
          code: code('import a from "a";', 'import type * as React from "react";'),
          output: code('import type * as React from "react";', 'import a from "a";'),
          errors,
        },
      ],
    });
  });
});
