import { randomBytes } from 'crypto';

export type GenerateStrategy = 'random' | 'uuid' | 'placeholder' | 'empty';

export interface GenerateOptions {
  strategy?: GenerateStrategy;
  length?: number;
  prefix?: string;
}

export interface GenerateResult {
  generated: Record<string, string>;
  count: number;
  strategy: GenerateStrategy;
}

/**
 * Generate a value based on the chosen strategy.
 */
export function generateValue(key: string, options: GenerateOptions = {}): string {
  const { strategy = 'placeholder', length = 32, prefix = '' } = options;

  switch (strategy) {
    case 'random':
      return prefix + randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
    case 'uuid':
      return prefix + generateUUID();
    case 'empty':
      return '';
    case 'placeholder':
    default:
      return prefix + `CHANGE_ME_${key.toUpperCase()}`;
  }
}

/**
 * Generate values for a list of keys.
 */
export function generateEnv(
  keys: string[],
  options: GenerateOptions = {}
): GenerateResult {
  const strategy = options.strategy ?? 'placeholder';
  const generated: Record<string, string> = {};

  for (const key of keys) {
    generated[key] = generateValue(key, options);
  }

  return { generated, count: keys.length, strategy };
}

/**
 * Generate values only for keys missing from the existing env record.
 */
export function generateMissingKeys(
  keys: string[],
  existing: Record<string, string>,
  options: GenerateOptions = {}
): GenerateResult {
  const missingKeys = keys.filter((k) => !(k in existing));
  return generateEnv(missingKeys, options);
}

export function formatGenerateResult(result: GenerateResult): string {
  const lines: string[] = [
    `Generated ${result.count} value(s) using strategy: ${result.strategy}`,
    '',
  ];
  for (const [key, value] of Object.entries(result.generated)) {
    lines.push(`  ${key}=${value}`);
  }
  return lines.join('\n');
}

function generateUUID(): string {
  const bytes = randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}
