import { EnvRecord } from '../parser/envParser';

export type Mask3Strategy = 'full' | 'partial' | 'length';

export interface Mask3Options {
  strategy?: Mask3Strategy;
  char?: string;
  visibleChars?: number;
}

export interface Mask3Result {
  original: EnvRecord;
  masked: EnvRecord;
  maskedKeys: string[];
}

export function maskValue3(
  value: string,
  options: Mask3Options = {}
): string {
  const { strategy = 'full', char = '*', visibleChars = 2 } = options;

  if (!value) return value;

  switch (strategy) {
    case 'full':
      return char.repeat(value.length);
    case 'partial': {
      const visible = Math.min(visibleChars, Math.floor(value.length / 2));
      const prefix = value.slice(0, visible);
      const suffix = value.slice(-visible);
      const middle = char.repeat(Math.max(1, value.length - visible * 2));
      return `${prefix}${middle}${suffix}`;
    }
    case 'length':
      return `${char.repeat(6)}(${value.length})`;
    default:
      return char.repeat(value.length);
  }
}

export function maskEnv3(
  env: EnvRecord,
  keys: string[],
  options: Mask3Options = {}
): Mask3Result {
  const masked: EnvRecord = { ...env };
  const maskedKeys: string[] = [];

  for (const key of keys) {
    if (key in env) {
      masked[key] = maskValue3(env[key], options);
      maskedKeys.push(key);
    }
  }

  return { original: env, masked, maskedKeys };
}

export function formatMask3Result(result: Mask3Result): string {
  const lines: string[] = [];
  lines.push(`Masked ${result.maskedKeys.length} key(s):`);
  for (const key of result.maskedKeys) {
    lines.push(`  ${key}: ${result.original[key]} → ${result.masked[key]}`);
  }
  return lines.join('\n');
}
