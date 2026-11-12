import { defineConfig, globalIgnores } from "eslint/config";

import { base } from "./src/eslint/index.js";

// This repo lints itself with its own config. Fixtures are linted by the
// integration tests, with their own config, and are meant to contain errors.
export default defineConfig(globalIgnores(["tests/fixtures/**"]), base);
