export type CastType = 'string' | 'number' | 'boolean' | 'json' | 'array';

export interface CastRule {
  key: string;
  type: CastType;
}

export interface CastResult {
  key: string;
  original: string;
  casted: unknown;
  type: CastType;
  success: boolean;
  error?: string;
}

export interface CastEnvResult {
  results: CastResult[];
  output: Record<string, unknown>;
  failed: string[];
}

export function castValue(value: string, type: CastType): unknown {
  switch (type) {
    case 'number': {
      const n = Number(value);
      if (isNaN(n)) throw new Error(`Cannot cast "${value}" to number`);
      return n;
    }
    case 'boolean': {
      const lower = value.toLowerCase();
      if (['true', '1', 'yes', 'on'].includes(lower)) return true;
      if (['false', '0', 'no', 'off'].includes(lower)) return false;
      throw new Error(`Cannot cast "${value}" to boolean`);
    }
    case 'json': {
      try {
        return JSON.parse(value);
      } catch {
        throw new Error(`Cannot cast "${value}" to JSON`);
      }
    }
    case 'array':
      return value.split(',').map(v => v.trim());
    case 'string':
    default:
      return value;
  }
}

export function castEnv(
  env: Record<string, string>,
  rules: CastRule[]
): CastEnvResult {
  const output: Record<string, unknown> = { ...env };
  const results: CastResult[] = [];
  const failed: string[] = [];

  for (const rule of rules) {
    const value = env[rule.key];
    if (value === undefined) continue;
    try {
      const casted = castValue(value, rule.type);
      output[rule.key] = casted;
      results.push({ key: rule.key, original: value, casted, type: rule.type, success: true });
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      results.push({ key: rule.key, original: value, casted: value, type: rule.type, success: false, error });
      failed.push(rule.key);
    }
  }

  return { results, output, failed };
}

export function formatCastResult(result: CastEnvResult): string {
  const lines: string[] = [];
  for (const r of result.results) {
    if (r.success) {
      lines.push(`  ✔ ${r.key}: "${r.original}" → ${r.type}(${JSON.stringify(r.casted)})`);
    } else {
      lines.push(`  ✘ ${r.key}: ${r.error}`);
    }
  }
  if (result.failed.length > 0) {
    lines.push(`\nFailed: ${result.failed.join(', ')}`);
  }
  return lines.join('\n');
}
