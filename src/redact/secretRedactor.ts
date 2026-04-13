/**
 * Secret redaction utilities for masking sensitive .env values
 */

const DEFAULT_SECRET_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /api[_-]?key/i,
  /auth/i,
  /private[_-]?key/i,
  /credentials/i,
  /passphrase/i,
];

const REDACTED_VALUE = '**REDACTED**';

export interface RedactOptions {
  patterns?: RegExp[];
  customKeys?: string[];
  redactedValue?: string;
}

/**
 * Determines whether a key should be redacted based on patterns and custom keys.
 */
export function shouldRedact(
  key: string,
  options: RedactOptions = {}
): boolean {
  const patterns = options.patterns ?? DEFAULT_SECRET_PATTERNS;
  const customKeys = options.customKeys ?? [];

  if (customKeys.map((k) => k.toUpperCase()).includes(key.toUpperCase())) {
    return true;
  }

  return patterns.some((pattern) => pattern.test(key));
}

/**
 * Redacts sensitive values from a parsed env record.
 */
export function redactEnv(
  env: Record<string, string>,
  options: RedactOptions = {}
): Record<string, string> {
  const replacement = options.redactedValue ?? REDACTED_VALUE;
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(env)) {
    result[key] = shouldRedact(key, options) ? replacement : value;
  }

  return result;
}

/**
 * Returns only the keys that would be redacted for a given env record.
 */
export function getRedactedKeys(
  env: Record<string, string>,
  options: RedactOptions = {}
): string[] {
  return Object.keys(env).filter((key) => shouldRedact(key, options));
}
