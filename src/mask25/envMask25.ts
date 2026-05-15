export interface Mask25Options {
  char?: string;
  visibleStart?: number;
  visibleEnd?: number;
  minLength?: number;
}

export interface Mask25Result {
  original: Record<string, string>;
  masked: Record<string, string>;
  count: number;
}

export function maskValue25(
  value: string,
  options: Mask25Options = {}
): string {
  const { char = '*', visibleStart = 2, visibleEnd = 2, minLength = 4 } = options;
  if (value.length < minLength) {
    return char.repeat(value.length);
  }
  const start = value.slice(0, visibleStart);
  const end = visibleEnd > 0 ? value.slice(-visibleEnd) : '';
  const middle = char.repeat(Math.max(1, value.length - visibleStart - visibleEnd));
  return `${start}${middle}${end}`;
}

export function maskEnv25(
  env: Record<string, string>,
  keys: string[],
  options: Mask25Options = {}
): Mask25Result {
  const masked: Record<string, string> = { ...env };
  let count = 0;
  for (const key of keys) {
    if (key in masked) {
      masked[key] = maskValue25(masked[key], options);
      count++;
    }
  }
  return { original: env, masked, count };
}

export function formatMask25Result(result: Mask25Result): string {
  const lines: string[] = [];
  lines.push(`Masked ${result.count} key(s).`);
  for (const [key, value] of Object.entries(result.masked)) {
    lines.push(`  ${key}=${value}`);
  }
  return lines.join('\n');
}
