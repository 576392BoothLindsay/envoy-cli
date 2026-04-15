import { shouldRedact } from '../redact/secretRedactor';

export type MaskStyle = 'stars' | 'partial' | 'length' | 'fixed';

export interface MaskOptions {
  style?: MaskStyle;
  visibleChars?: number;
  fixedMask?: string;
}

export interface MaskResult {
  original: Record<string, string>;
  masked: Record<string, string>;
  maskedKeys: string[];
}

export function maskValue(value: string, options: MaskOptions = {}): string {
  const { style = 'stars', visibleChars = 4, fixedMask = '***' } = options;

  if (value.length === 0) return value;

  switch (style) {
    case 'stars':
      return '*'.repeat(value.length);

    case 'partial': {
      const visible = Math.min(visibleChars, Math.floor(value.length / 2));
      if (visible === 0) return '*'.repeat(value.length);
      return value.slice(0, visible) + '*'.repeat(value.length - visible);
    }

    case 'length':
      return `[${value.length} chars]`;

    case 'fixed':
      return fixedMask;

    default:
      return '*'.repeat(value.length);
  }
}

export function maskEnv(
  env: Record<string, string>,
  options: MaskOptions = {},
  customKeys: string[] = []
): MaskResult {
  const masked: Record<string, string> = {};
  const maskedKeys: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    const shouldMask = shouldRedact(key) || customKeys.includes(key);
    if (shouldMask) {
      masked[key] = maskValue(value, options);
      maskedKeys.push(key);
    } else {
      masked[key] = value;
    }
  }

  return { original: env, masked, maskedKeys };
}

export function formatMaskResult(result: MaskResult): string {
  const lines: string[] = [];
  lines.push(`Masked ${result.maskedKeys.length} key(s):`);
  for (const key of result.maskedKeys) {
    lines.push(`  ${key}: ${result.original[key]} → ${result.masked[key]}`);
  }
  return lines.join('\n');
}
