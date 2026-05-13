import { parseEnv } from '../parser/envParser';

export interface Mask15Options {
  char?: string;
  visibleStart?: number;
  visibleEnd?: number;
  minLength?: number;
}

export interface Mask15Result {
  original: Record<string, string>;
  masked: Record<string, string>;
  maskedKeys: string[];
}

const DEFAULT_OPTIONS: Required<Mask15Options> = {
  char: '*',
  visibleStart: 2,
  visibleEnd: 2,
  minLength: 6,
};

export function maskValue15(value: string, options: Mask15Options = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  if (value.length < opts.minLength) {
    return opts.char.repeat(value.length);
  }
  const start = value.slice(0, opts.visibleStart);
  const end = value.slice(value.length - opts.visibleEnd);
  const middle = opts.char.repeat(value.length - opts.visibleStart - opts.visibleEnd);
  return `${start}${middle}${end}`;
}

export function maskEnv15(
  env: Record<string, string>,
  keys: string[],
  options: Mask15Options = {}
): Mask15Result {
  const masked: Record<string, string> = { ...env };
  const maskedKeys: string[] = [];

  for (const key of keys) {
    if (key in env) {
      masked[key] = maskValue15(env[key], options);
      maskedKeys.push(key);
    }
  }

  return { original: env, masked, maskedKeys };
}

export function formatMask15Result(result: Mask15Result): string {
  if (result.maskedKeys.length === 0) {
    return 'No keys masked.';
  }
  const lines = result.maskedKeys.map(
    (key) => `  ${key}: ${result.original[key]} -> ${result.masked[key]}`
  );
  return `Masked ${result.maskedKeys.length} key(s):\n${lines.join('\n')}`;
}
