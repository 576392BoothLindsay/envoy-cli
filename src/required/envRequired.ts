import type { EnvRecord } from '../parser/envParser';

export interface RequiredCheckResult {
  missing: string[];
  present: string[];
  total: number;
  valid: boolean;
}

export function checkRequired(
  env: EnvRecord,
  required: string[]
): RequiredCheckResult {
  const missing: string[] = [];
  const present: string[] = [];

  for (const key of required) {
    if (key in env && env[key] !== '') {
      present.push(key);
    } else {
      missing.push(key);
    }
  }

  return {
    missing,
    present,
    total: required.length,
    valid: missing.length === 0,
  };
}

export function formatRequiredResult(result: RequiredCheckResult): string {
  const lines: string[] = [];

  if (result.valid) {
    lines.push(`✔ All ${result.total} required key(s) are present.`);
  } else {
    lines.push(
      `✖ ${result.missing.length} of ${result.total} required key(s) missing:`
    );
    for (const key of result.missing) {
      lines.push(`  - ${key}`);
    }
  }

  if (result.present.length > 0) {
    lines.push(`\nPresent (${result.present.length}):`);
    for (const key of result.present) {
      lines.push(`  ✔ ${key}`);
    }
  }

  return lines.join('\n');
}
