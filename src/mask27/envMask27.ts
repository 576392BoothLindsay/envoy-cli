export interface Mask27Options {
  char?: string;
  visibleStart?: number;
  visibleEnd?: number;
  minLength?: number;
}

export interface Mask27Result {
  original: Record<string, string>;
  masked: Record<string, string>;
  maskedKeys: string[];
}

export function maskValue27(
  value: string,
  options: Mask27Options = {}
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
  const middle = char.repeat(Math.max(1, value.length - visibleStart - visibleEnd));

  return `${start}${middle}${end}`;
}

export function maskEnv27(
  env: Record<string, string>,
  keys: string[],
  options: Mask27Options = {}
): Mask27Result {
  const masked: Record<string, string> = { ...env };
  const maskedKeys: string[] = [];

  for (const key of keys) {
    if (key in env) {
      masked[key] = maskValue27(env[key], options);
      maskedKeys.push(key);
    }
  }

  return { original: env, masked, maskedKeys };
}

export function formatMask27Result(result: Mask27Result): string {
  if (result.maskedKeys.length === 0) {
    return 'No keys masked.';
  }
  const lines = result.maskedKeys.map(
    (k) => `  ${k}: ${result.masked[k]}`
  );
  return `Masked ${result.maskedKeys.length} key(s):\n${lines.join('\n')}`;
}
