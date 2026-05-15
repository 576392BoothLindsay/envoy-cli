export interface Mask22Options {
  char?: string;
  visibleStart?: number;
  visibleEnd?: number;
  minLength?: number;
}

export interface Mask22Result {
  original: Record<string, string>;
  masked: Record<string, string>;
  maskedKeys: string[];
}

export function maskValue22(
  value: string,
  options: Mask22Options = {}
): string {
  const {
    char = '*',
    visibleStart = 2,
    visibleEnd = 2,
    minLength = 6,
  } = options;

  if (value.length < minLength) {
    return char.repeat(value.length);
  }

  const start = value.slice(0, visibleStart);
  const end = visibleEnd > 0 ? value.slice(-visibleEnd) : '';
  const middleLength = value.length - visibleStart - visibleEnd;
  const middle = char.repeat(Math.max(middleLength, 1));

  return `${start}${middle}${end}`;
}

export function maskEnv22(
  env: Record<string, string>,
  keys: string[],
  options: Mask22Options = {}
): Mask22Result {
  const masked: Record<string, string> = { ...env };
  const maskedKeys: string[] = [];

  for (const key of keys) {
    if (key in env) {
      masked[key] = maskValue22(env[key], options);
      maskedKeys.push(key);
    }
  }

  return { original: env, masked, maskedKeys };
}

export function formatMask22Result(result: Mask22Result): string {
  if (result.maskedKeys.length === 0) {
    return 'No keys masked.';
  }
  const lines = result.maskedKeys.map(
    (key) => `  ${key}: ${result.masked[key]}`
  );
  return `Masked ${result.maskedKeys.length} key(s):\n${lines.join('\n')}`;
}
