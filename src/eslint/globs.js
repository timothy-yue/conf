export const TS_FILES = ["**/*.{ts,tsx,mts,cts}"];
export const JS_FILES = ["**/*.{js,jsx,mjs,cjs}"];
export const SOURCE_FILES = [...TS_FILES, ...JS_FILES];

export const IGNORED = [
  "**/node_modules/**",
  "**/dist/**",
  "**/build/**",
  "**/out/**",
  "**/coverage/**",
  "**/.next/**",
  "**/.turbo/**",
  "**/.vercel/**",
  "**/*.min.js",
];
