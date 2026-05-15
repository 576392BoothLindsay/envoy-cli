export interface Mask20Options {
  char?: string;
  visibleStart?: number;
  visibleEnd?: number;
  minLength?: number;
}

export interface Mask20Result {
  original: Record<string, string>;
  masked: Record<string, string>;
  maskedKeys: string[];
}

const DEFAULT_CHAR = '*';
const DEFAULT_VISIBLE_START = 2;
const DEFAULT_VISIBLE_END = 2;
const DEFAULT_MIN_LENGTH = 4;

export function maskValue20(
  value: string,
  options: Mask20Options = {}
): string {
  const char = options.char ?? DEFAULT_CHAR;
  const visibleStart = options.visibleStart ?? DEFAULT_VISIBLE_START;
  const visibleEnd = options.visibleEnd ?? DEFAULT_VISIBLE_END;
  const minLength = options.minLength ?? DEFAULT_MIN_LENGTH;

  if (value.length < minLength) {
    return char.repeat(value.length);
  }

  const start = value.slice(0, visibleStart);
  const end = visibleEnd > 0 ? value.slice(-visibleEnd) : '';
  const maskLength = Math.max(1, value.length - visibleStart - visibleEnd);
  const middle = char.repeat(maskLength);

  return `${start}${middle}${end}`;
}

export function maskEnv20(
  env: Record<string, string>,
  keys: string[],
  options: Mask20Options = {}
): Mask20Result {
  const masked: Record<string, string> = { ...env };
  const maskedKeys: string[] = [];

  for (const key of keys) {
    if (key in env) {
      masked[key] = maskValue20(env[key], options);
      maskedKeys.push(key);
    }
  }

  return { original: env, masked, maskedKeys };
}

export function formatMask20Result(result: Mask20Result): string {
  if (result.maskedKeys.length === 0) {
    return 'No keys masked.';
  }
  const lines = result.maskedKeys.map(
    (key) => `  ${key}: ${result.masked[key]}`
  );
  return `Masked ${result.maskedKeys.length} key(s):\n${lines.join('\n')}`;
}
