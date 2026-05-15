export interface Mask26Options {
  char?: string;
  visibleStart?: number;
  visibleEnd?: number;
  minLength?: number;
}

export interface Mask26Result {
  original: Record<string, string>;
  masked: Record<string, string>;
  maskedKeys: string[];
}

export function maskValue26(
  value: string,
  options: Mask26Options = {}
): string {
  const {
    char = '*',
    visibleStart = 2,
    visibleEnd = 2,
    minLength = 4,
  } = options;

  if (value.length < minLength) {
    return char.repeat(value.length);
  }

  const start = value.slice(0, visibleStart);
  const end = visibleEnd > 0 ? value.slice(-visibleEnd) : '';
  const middle = char.repeat(
    Math.max(1, value.length - visibleStart - visibleEnd)
  );

  return `${start}${middle}${end}`;
}

export function maskEnv26(
  env: Record<string, string>,
  keys: string[],
  options: Mask26Options = {}
): Mask26Result {
  const masked: Record<string, string> = { ...env };
  const maskedKeys: string[] = [];

  for (const key of keys) {
    if (key in env) {
      masked[key] = maskValue26(env[key], options);
      maskedKeys.push(key);
    }
  }

  return { original: env, masked, maskedKeys };
}

export function formatMask26Result(result: Mask26Result): string {
  if (result.maskedKeys.length === 0) {
    return 'No keys masked.';
  }
  const lines = result.maskedKeys.map(
    (k) => `  ${k}: ${result.masked[k]}`
  );
  return `Masked ${result.maskedKeys.length} key(s):\n${lines.join('\n')}`;
}
