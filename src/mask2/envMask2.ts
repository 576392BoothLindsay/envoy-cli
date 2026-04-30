export type MaskStrategy = 'full' | 'partial' | 'length';

export interface Mask2Options {
  strategy?: MaskStrategy;
  char?: string;
  visibleStart?: number;
  visibleEnd?: number;
}

export interface Mask2Result {
  original: Record<string, string>;
  masked: Record<string, string>;
  maskedKeys: string[];
}

const DEFAULT_CHAR = '*';

export function maskValue2(
  value: string,
  options: Mask2Options = {}
): string {
  const { strategy = 'full', char = DEFAULT_CHAR, visibleStart = 2, visibleEnd = 2 } = options;

  if (value.length === 0) return value;

  if (strategy === 'full') {
    return char.repeat(value.length);
  }

  if (strategy === 'length') {
    return char.repeat(8);
  }

  if (strategy === 'partial') {
    if (value.length <= visibleStart + visibleEnd) {
      return char.repeat(value.length);
    }
    const start = value.slice(0, visibleStart);
    const end = value.slice(value.length - visibleEnd);
    const middle = char.repeat(value.length - visibleStart - visibleEnd);
    return `${start}${middle}${end}`;
  }

  return char.repeat(value.length);
}

export function maskEnv2(
  env: Record<string, string>,
  keys: string[],
  options: Mask2Options = {}
): Mask2Result {
  const masked: Record<string, string> = { ...env };
  const maskedKeys: string[] = [];

  for (const key of keys) {
    if (key in env) {
      masked[key] = maskValue2(env[key], options);
      maskedKeys.push(key);
    }
  }

  return { original: env, masked, maskedKeys };
}

export function formatMask2Result(result: Mask2Result): string {
  if (result.maskedKeys.length === 0) {
    return 'No keys masked.';
  }
  const lines = result.maskedKeys.map(
    (key) => `  ${key}: ${result.original[key]} → ${result.masked[key]}`
  );
  return `Masked ${result.maskedKeys.length} key(s):\n${lines.join('\n')}`;
}
