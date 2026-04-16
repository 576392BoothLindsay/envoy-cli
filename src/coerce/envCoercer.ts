export type CoerceType = 'string' | 'number' | 'boolean' | 'json';

export interface CoerceRule {
  key: string;
  type: CoerceType;
}

export interface CoerceResult {
  coerced: Record<string, string>;
  changes: Array<{ key: string; from: string; to: string; type: CoerceType }>;
  errors: Array<{ key: string; value: string; type: CoerceType; reason: string }>;
}

export function coerceValue(value: string, type: CoerceType): string {
  switch (type) {
    case 'boolean': {
      const lower = value.trim().toLowerCase();
      if (['1', 'true', 'yes', 'on'].includes(lower)) return 'true';
      if (['0', 'false', 'no', 'off'].includes(lower)) return 'false';
      throw new Error(`Cannot coerce "${value}" to boolean`);
    }
    case 'number': {
      const num = Number(value.trim());
      if (isNaN(num)) throw new Error(`Cannot coerce "${value}" to number`);
      return String(num);
    }
    case 'json': {
      try {
        JSON.parse(value);
        return value;
      } catch {
        throw new Error(`Cannot coerce "${value}" to JSON`);
      }
    }
    case 'string':
    default:
      return String(value);
  }
}

export function coerceEnv(
  env: Record<string, string>,
  rules: CoerceRule[]
): CoerceResult {
  const coerced = { ...env };
  const changes: CoerceResult['changes'] = [];
  const errors: CoerceResult['errors'] = [];

  for (const rule of rules) {
    const { key, type } = rule;
    if (!(key in env)) continue;
    const original = env[key];
    try {
      const converted = coerceValue(original, type);
      if (converted !== original) {
        coerced[key] = converted;
        changes.push({ key, from: original, to: converted, type });
      }
    } catch (err) {
      errors.push({ key, value: original, type, reason: (err as Error).message });
    }
  }

  return { coerced, changes, errors };
}

export function formatCoerceResult(result: CoerceResult): string {
  const lines: string[] = [];
  if (result.changes.length > 0) {
    lines.push('Coerced:');
    for (const c of result.changes) {
      lines.push(`  ${c.key}: "${c.from}" → "${c.to}" (${c.type})`);
    }
  }
  if (result.errors.length > 0) {
    lines.push('Errors:');
    for (const e of result.errors) {
      lines.push(`  ${e.key}: ${e.reason}`);
    }
  }
  if (lines.length === 0) lines.push('No coercions applied.');
  return lines.join('\n');
}
