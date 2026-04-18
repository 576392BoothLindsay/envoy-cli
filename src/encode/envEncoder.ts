export type EncodeFormat = 'base64' | 'hex' | 'uri';

export interface EncodeResult {
  encoded: Record<string, string>;
  skipped: string[];
  format: EncodeFormat;
}

export function encodeValue(value: string, format: EncodeFormat): string {
  switch (format) {
    case 'base64':
      return Buffer.from(value).toString('base64');
    case 'hex':
      return Buffer.from(value).toString('hex');
    case 'uri':
      return encodeURIComponent(value);
    default:
      throw new Error(`Unknown encode format: ${format}`);
  }
}

export function decodeValue(value: string, format: EncodeFormat): string {
  switch (format) {
    case 'base64':
      return Buffer.from(value, 'base64').toString('utf8');
    case 'hex':
      return Buffer.from(value, 'hex').toString('utf8');
    case 'uri':
      return decodeURIComponent(value);
    default:
      throw new Error(`Unknown encode format: ${format}`);
  }
}

export function encodeEnv(
  env: Record<string, string>,
  keys: string[],
  format: EncodeFormat
): EncodeResult {
  const encoded: Record<string, string> = { ...env };
  const skipped: string[] = [];

  for (const key of keys) {
    if (key in env) {
      encoded[key] = encodeValue(env[key], format);
    } else {
      skipped.push(key);
    }
  }

  return { encoded, skipped, format };
}

export function decodeEnv(
  env: Record<string, string>,
  keys: string[],
  format: EncodeFormat
): EncodeResult {
  const encoded: Record<string, string> = { ...env };
  const skipped: string[] = [];

  for (const key of keys) {
    if (key in env) {
      encoded[key] = decodeValue(env[key], format);
    } else {
      skipped.push(key);
    }
  }

  return { encoded, skipped, format };
}

export function formatEncodeResult(result: EncodeResult): string {
  const lines: string[] = [`Format: ${result.format}`];
  const changed = Object.keys(result.encoded).length - result.skipped.length;
  lines.push(`Processed: ${changed} key(s)`);
  if (result.skipped.length > 0) {
    lines.push(`Skipped (not found): ${result.skipped.join(', ')}`);
  }
  return lines.join('\n');
}
