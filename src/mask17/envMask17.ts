export interface Mask17Options {
  char?: string;
  visibleStart?: number;
  visibleEnd?: number;
  minLength?: number;
}

export interface Mask17Result {
  original: Record<string, string>;
  masked: Record<string, string>;
  maskedKeys: string[];
}

const DEFAULT_OPTIONS: Required<Mask17Options> = {
  char: '*',
  visibleStart: 2,
  visibleEnd: 2,
  minLength: 6,
};

export function maskValue17(value: string, options: Mask17Options = {}): string {
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

export function maskEnv17(
  env: Record<string, string>,
  keys: string[],
  options: Mask17Options = {}
): Mask17Result {
  const masked: Record<string, string> = { ...env };
  const maskedKeys: string[] = [];

  for (const key of keys) {
    if (key in env) {
      masked[key] = maskValue17(env[key], options);
      maskedKeys.push(key);
    }
  }

  return { original: env, masked, maskedKeys };
}

export function formatMask17Result(result: Mask17Result): string {
  if (result.maskedKeys.length === 0) {
    return 'No keys masked.';
  }
  const lines = result.maskedKeys.map(
    (k) => `  ${k}: ${result.masked[k]}`
  );
  return `Masked ${result.maskedKeys.length} key(s):\n${lines.join('\n')}`;
}
