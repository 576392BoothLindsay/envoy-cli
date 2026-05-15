export interface Mask21Options {
  char?: string;
  visibleStart?: number;
  visibleEnd?: number;
  minLength?: number;
}

export interface Mask21Result {
  original: Record<string, string>;
  masked: Record<string, string>;
  maskedKeys: string[];
}

const DEFAULT_CHAR = '*';
const DEFAULT_VISIBLE_START = 2;
const DEFAULT_VISIBLE_END = 2;
const DEFAULT_MIN_LENGTH = 6;

export function maskValue21(
  value: string,
  options: Mask21Options = {}
): string {
  const {
    char = DEFAULT_CHAR,
    visibleStart = DEFAULT_VISIBLE_START,
    visibleEnd = DEFAULT_VISIBLE_END,
    minLength = DEFAULT_MIN_LENGTH,
  } = options;

  if (value.length < minLength) {
    return char.repeat(value.length);
  }

  const start = value.slice(0, visibleStart);
  const end = value.slice(-visibleEnd);
  const middle = char.repeat(value.length - visibleStart - visibleEnd);
  return `${start}${middle}${end}`;
}

export function maskEnv21(
  env: Record<string, string>,
  keys: string[],
  options: Mask21Options = {}
): Mask21Result {
  const masked: Record<string, string> = { ...env };
  const maskedKeys: string[] = [];

  for (const key of keys) {
    if (key in env) {
      masked[key] = maskValue21(env[key], options);
      maskedKeys.push(key);
    }
  }

  return { original: env, masked, maskedKeys };
}

export function formatMask21Result(result: Mask21Result): string {
  if (result.maskedKeys.length === 0) {
    return 'No keys masked.';
  }
  const lines = result.maskedKeys.map(
    (k) => `  ${k}: ${result.masked[k]}`
  );
  return `Masked ${result.maskedKeys.length} key(s):\n${lines.join('\n')}`;
}
