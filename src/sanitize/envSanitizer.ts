export type SanitizeOptions = {
  stripControlChars?: boolean;
  trimWhitespace?: boolean;
  removeEmpty?: boolean;
  maxLength?: number;
};

export type SanitizeResult = {
  original: Record<string, string>;
  sanitized: Record<string, string>;
  changes: Array<{ key: string; reason: string }>;
  removedKeys: string[];
};

export function sanitizeValue(value: string, options: SanitizeOptions = {}): string {
  let result = value;

  if (options.trimWhitespace !== false) {
    result = result.trim();
  }

  if (options.stripControlChars !== false) {
    // eslint-disable-next-line no-control-regex
    result = result.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  }

  if (options.maxLength !== undefined && result.length > options.maxLength) {
    result = result.slice(0, options.maxLength);
  }

  return result;
}

export function sanitizeEnv(
  env: Record<string, string>,
  options: SanitizeOptions = {}
): SanitizeResult {
  const sanitized: Record<string, string> = {};
  const changes: Array<{ key: string; reason: string }> = [];
  const removedKeys: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    const clean = sanitizeValue(value, options);

    if (options.removeEmpty && clean === '') {
      removedKeys.push(key);
      continue;
    }

    sanitized[key] = clean;

    if (clean !== value) {
      const reasons: string[] = [];
      if (value.trim() !== value) reasons.push('trimmed whitespace');
      if (clean.length < value.trim().length) reasons.push('stripped control chars');
      if (options.maxLength !== undefined && value.length > options.maxLength) reasons.push('truncated to max length');
      changes.push({ key, reason: reasons.join(', ') || 'modified' });
    }
  }

  return { original: env, sanitized, changes, removedKeys };
}

export function formatSanitizeResult(result: SanitizeResult): string {
  const lines: string[] = [];

  if (result.changes.length === 0 && result.removedKeys.length === 0) {
    lines.push('No sanitization changes needed.');
    return lines.join('\n');
  }

  if (result.changes.length > 0) {
    lines.push(`Modified (${result.changes.length}):`);
    for (const { key, reason } of result.changes) {
      lines.push(`  ${key}: ${reason}`);
    }
  }

  if (result.removedKeys.length > 0) {
    lines.push(`Removed empty (${result.removedKeys.length}):`);
    for (const key of result.removedKeys) {
      lines.push(`  ${key}`);
    }
  }

  return lines.join('\n');
}

/**
 * Returns true if the env record would be unchanged by sanitization.
 */
export function isClean(env: Record<string, string>, options: SanitizeOptions = {}): boolean {
  const result = sanitizeEnv(env, options);
  return result.changes.length === 0 && result.removedKeys.length === 0;
}
