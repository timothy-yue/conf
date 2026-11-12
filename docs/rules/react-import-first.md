# `tim/react-import-first`

Requires `import * as React from "react"` to be the first statement of the file.

- **Enabled by**: the `react` config, as an error
- **Fixable**: yes, `eslint --fix` moves the import to the top
- **Options**: none

## Why

Files that use the React namespace import all start the same way, which makes a React module recognisable at a glance and keeps the import from drifting around as import blocks are edited and sorted.

## What it checks

The rule only looks at files that contain a namespace import from `"react"`. In those files, that import must come before every other statement.

Two things may sit above it:

- **Directives** such as `"use client"` or `"use strict"`, which the language requires to come first.
- **Comments**, such as licence headers and `eslint-disable` comments.

A type-only namespace import (`import type * as React from "react"`) is held to the same position.

The rule has no opinion on files that import React another way (`import React from "react"`, `import { useState } from "react"`) or not at all. It enforces the position of the namespace import; it does not require one.

## Examples

Incorrect:

```tsx
import { Button } from "./Button";
import * as React from "react";
```

```tsx
import "./styles.css";
import * as React from "react";
```

```tsx
const DEFAULT_SIZE = 16;
import * as React from "react";
```

Correct:

```tsx
import * as React from "react";

import { Button } from "./Button";
```

```tsx
"use client";

// Comments are fine here.
import * as React from "react";

import { Button } from "./Button";
```

```ts
// No namespace import from "react": the rule does not apply.
import { useState } from "react";
```

## The fix

The fixer moves the import statement to just above the first statement of the file, below any directives and below the comments that lead the file. The other imports keep their order.

Comments attached to the React import itself are not moved with it.

## Interaction with import sorters

An import-sorting rule or Prettier plugin that orders `"react"` alphabetically will fight this rule. Configure the sorter to place `react` first, or to leave the first import alone.

## Implementation

- Rule: [`src/eslint-plugin/rules/react-import-first.js`](../../src/eslint-plugin/rules/react-import-first.js)
- Tests: [`tests/rules/react-import-first.test.js`](../../tests/rules/react-import-first.test.js)
