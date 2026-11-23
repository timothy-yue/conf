// Type-checks, but breaks the function style rules: named functions must be
// declarations, and callbacks must be arrow functions.
export const double = (n: number): number => n * 2;

export const triple = function (n: number): number {
  return n * 3;
};

export function squares(values: readonly number[]): number[] {
  return values.map(function (n) {
    return n * n;
  });
}
