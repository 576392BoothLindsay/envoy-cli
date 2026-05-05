export type EnvTypeRule = {
  type: 'string' | 'number' | 'boolean' | 'url' | 'email' | 'integer';
  optional?: boolean;
};

export type EnvTypeSchema = Record<string, EnvTypeRule>;

export type TypeCheckViolation = {
  key: string;
  value: string;
  expectedType: string;
  reason: string;
};

export type TypeCheckResult = {
  valid: boolean;
  violations: TypeCheckViolation[];
  checkedCount: number;
};

const TYPE_VALIDATORS: Record<string, (v: string) => boolean> = {
  string: () => true,
  number: (v) => !isNaN(Number(v)) && v.trim() !== '',
  integer: (v) => Number.isInteger(Number(v)) && v.trim() !== '',
  boolean: (v) => ['true', 'false', '1', '0', 'yes', 'no'].includes(v.toLowerCase()),
  url: (v) => { try { new URL(v); return true; } catch { return false; } },
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
};

export function checkType(key: string, value: string, rule: EnvTypeRule): TypeCheckViolation | null {
  const validator = TYPE_VALIDATORS[rule.type];
  if (!validator) return null;
  if (!validator(value)) {
    return {
      key,
      value,
      expectedType: rule.type,
      reason: `Value "${value}" is not a valid ${rule.type}`,
    };
  }
  return null;
}

export function typecheckEnv(
  env: Record<string, string>,
  schema: EnvTypeSchema
): TypeCheckResult {
  const violations: TypeCheckViolation[] = [];
  let checkedCount = 0;

  for (const [key, rule] of Object.entries(schema)) {
    const value = env[key];
    if (value === undefined || value === '') {
      if (!rule.optional) {
        violations.push({ key, value: '', expectedType: rule.type, reason: `Key "${key}" is required but missing` });
      }
      continue;
    }
    checkedCount++;
    const violation = checkType(key, value, rule);
    if (violation) violations.push(violation);
  }

  return { valid: violations.length === 0, violations, checkedCount };
}

export function formatTypecheckResult(result: TypeCheckResult): string {
  if (result.valid) {
    return `✔ All ${result.checkedCount} checked keys passed type validation.`;
  }
  const lines = [`✘ ${result.violations.length} type violation(s) found:`];
  for (const v of result.violations) {
    lines.push(`  [${v.key}] ${v.reason}`);
  }
  return lines.join('\n');
}
