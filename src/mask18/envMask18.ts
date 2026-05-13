export interface Mask18Options {
  char?: string;
  visibleStart?: number;
  visibleEnd?: number;
  minLength?: number;
}

export interface Mask18Result {
  original: Record<string, string>;
  masked: Record<string, string>;
  maskedKeys: string[];
}

const DEFAULT_OPTIONS: Required<Mask18Options> = {
  char: '*',
  visibleStart: 2,
  visibleEnd: 2,
  minLength: 6,
};

export function maskValue18(value: string, options: Mask18Options = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  if (value.length < opts.minLength) {
    return opts.char.repeat(value.length);
  }
  const start = value.slice(0, opts.visibleStart);
  const end = opts.visibleEnd > 0 ? value.slice(-opts.visibleEnd) : '';
  const maskLen = value.length - opts.visibleStart - opts.visibleEnd;
  const middle = opts.char.repeat(Math.max(0, maskLen));
  return `${start}${middle}${end}`;
}

export function maskEnv18(
  env: Record<string, string>,
  keys: string[],
  options: Mask18Options = {}
): Mask18Result {
  const masked: Record<string, string> = { ...env };
  const maskedKeys: string[] = [];

  for (const key of keys) {
    if (key in env) {
      masked[key] = maskValue18(env[key], options);
      maskedKeys.push(key);
    }
  }

  return { original: env, masked, maskedKeys };
}

export function formatMask18Result(result: Mask18Result): string {
  const lines: string[] = [];
  for (const key of result.maskedKeys) {
    lines.push(`${key}: ${result.original[key]} → ${result.masked[key]}`);
  }
  if (lines.length === 0) return 'No keys masked.';
  return `Masked ${result.maskedKeys.length} key(s):\n${lines.join('\n')}`;
}
