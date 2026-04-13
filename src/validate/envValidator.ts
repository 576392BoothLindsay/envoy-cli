import { ParsedEnv } from '../parser/envParser';

export interface ValidationRule {
  key: string;
  required?: boolean;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
}

export interface ValidationError {
  key: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export function validateEnv(
  env: ParsedEnv,
  rules: ValidationRule[]
): ValidationResult {
  const errors: ValidationError[] = [];

  for (const rule of rules) {
    const value = env[rule.key];

    if (rule.required && (value === undefined || value === '')) {
      errors.push({ key: rule.key, message: `"${rule.key}" is required but missing or empty` });
      continue;
    }

    if (value === undefined) continue;

    if (rule.pattern && !rule.pattern.test(value)) {
      errors.push({ key: rule.key, message: `"${rule.key}" does not match required pattern` });
    }

    if (rule.minLength !== undefined && value.length < rule.minLength) {
      errors.push({ key: rule.key, message: `"${rule.key}" must be at least ${rule.minLength} characters` });
    }

    if (rule.maxLength !== undefined && value.length > rule.maxLength) {
      errors.push({ key: rule.key, message: `"${rule.key}" must be at most ${rule.maxLength} characters` });
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateRequiredKeys(
  env: ParsedEnv,
  requiredKeys: string[]
): ValidationResult {
  const rules: ValidationRule[] = requiredKeys.map((key) => ({ key, required: true }));
  return validateEnv(env, rules);
}

export function formatValidationErrors(result: ValidationResult): string {
  if (result.valid) return 'All validations passed.';
  return result.errors.map((e) => `  ✖ ${e.message}`).join('\n');
}
