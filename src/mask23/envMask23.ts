export interface Mask23Options {
  char?: string;
  visibleStart?: number;
  visibleEnd?: number;
  minLength?: number;
}

export interface Mask23Result {
  original: Record<string, string>;
  masked: Record<string, string>;
  maskedKeys: string[];
}

export function maskValue23(
  value: string,
  options: Mask23Options = {}
): string {
  const { char = '*', visibleStart = 2, visibleEnd = 2, minLength = 4 } = options;
  if (value.length < minLength) return char.repeat(value.length);
  const start = value.slice(0, visibleStart);
  const end = visibleEnd > 0 ? value.slice(-visibleEnd) : '';
  const middle = char.repeat(Math.max(1, value.length - visibleStart - visibleEnd));
  return `${start}${middle}${end}`;
}

export function maskEnv23(
  env: Record<string, string>,
  keys: string[],
  options: Mask23Options = {}
): Mask23Result {
  const masked: Record<string, string> = { ...env };
  const maskedKeys: string[] = [];

  for (const key of keys) {
    if (key in env) {
      masked[key] = maskValue23(env[key], options);
      maskedKeys.push(key);
    }
  }

  return { original: env, masked, maskedKeys };
}

export function formatMask23Result(result: Mask23Result): string {
  if (result.maskedKeys.length === 0) return 'No keys masked.';
  const lines = result.maskedKeys.map(
    (k) => `  ${k}: ${result.masked[k]}`
  );
  return `Masked ${result.maskedKeys.length} key(s):\n${lines.join('\n')}`;
}
