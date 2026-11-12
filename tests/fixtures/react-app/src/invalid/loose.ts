// Every statement here type-checks, and every one breaks the base lint config.
export function parse(input: string): unknown {
  var result: any = JSON.parse(input);
  if (result == null) return null;
  return result;
}
