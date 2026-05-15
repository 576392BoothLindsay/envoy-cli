export interface Mask24Options {
  char?: string;
  visibleStart?: number;
  visibleEnd?: number;
  minLength?: number;
}

export interface Mask24Result {
  original: Record<string, string>;
  masked: Record<string, string>;
  maskedKeys: string[];
}

export function maskValue24(
  value: string,
  options: Mask24Options = {}
): string {
  const {
    char = '*',
    visibleStart = 0,
    visibleEnd = 4,
    minLength = 3,
  } = options;

  if (value.length < minLength) {
    return char.repeat(value.length);
  }

  const start = value.slice(0, visibleStart);
  const end = value.length > visibleEnd ? value.slice(-visibleEnd) : '';
  const middle = char.repeat(
    Math.max(1, value.length - visibleStart - (end.length))
  );

  return `${start}${middle}${end}`;
}

export function maskEnv24(
  env: Record<string, string>,
  keys: string[],
  options: Mask24Options = {}
): Mask24Result {
  const masked: Record<string, string> = { ...env };
  const maskedKeys: string[] = [];

  for (const key of keys) {
    if (key in env) {
      masked[key] = maskValue24(env[key], options);
      maskedKeys.push(key);
    }
  }

  return { original: env, masked, maskedKeys };
}

export function formatMask24Result(result: Mask24Result): string {
  if (result.maskedKeys.length === 0) {
    return 'No keys masked.';
  }
  const lines = result.maskedKeys.map(
    (k) => `  ${k}: ${result.masked[k]}`
  );
  return `Masked ${result.maskedKeys.length} key(s):\n${lines.join('\n')}`;
}
