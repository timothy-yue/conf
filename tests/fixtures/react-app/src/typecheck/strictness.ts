// Each @ts-expect-error below is only satisfied while the named compiler option
// is on. Loosen the shared tsconfig and `tsc` fails here with an unused
// directive, which is exactly what the integration test watches for.

const words: string[] = [];

// @ts-expect-error noUncheckedIndexedAccess: an indexed read may be undefined
export const firstWord: string = words[0];

interface Options {
  label?: string;
}

// @ts-expect-error exactOptionalPropertyTypes: optional is not `| undefined`
export const options: Options = { label: undefined };

const env: Record<string, string> = {};

// @ts-expect-error noPropertyAccessFromIndexSignature: use bracket access
export const home = env.HOME;

// @ts-expect-error erasableSyntaxOnly: enums emit runtime code
export enum Direction {
  Up,
  Down,
}

// @ts-expect-error strict: implicit any parameter
export function identity(value) {
  return value as unknown;
}

class Shape {
  area(): number {
    return 0;
  }
}

export class Square extends Shape {
  // @ts-expect-error noImplicitOverride: the override keyword is required
  area(): number {
    return 1;
  }
}
