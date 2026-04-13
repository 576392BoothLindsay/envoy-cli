import { ParsedEnv } from '../parser/envParser';

export interface ValidationRule {
  key: string;
  required?: boolean;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  allowedValues?: string[];
}

export interface ValidationError {
  key: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validates a parsed environment object against a set of rules.
 * Returns a ValidationResult indicating whether all rules passed and any errors encountered.
 */
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

    if (rule.allowedValues !== undefined && !rule.allowedValues.includes(value)) {
      errors.push({ key: rule.key, message: `"${rule.key}" must be one of: ${rule.allowedValues.join(', ')}` });
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates that all specified keys are present and non-empty in the environment.
 */
export function validateRequiredKeys(
  env: ParsedEnv,
  requiredKeys: string[]
): ValidationResult {
  const rules: ValidationRule[] = requiredKeys.map((key) => ({ key, required: true }));
  return validateEnv(env, rules);
}

/**
 * Checks whether a given key exists and has a non-empty value in the environment.
 */
export function hasKey(env: ParsedEnv, key: string): boolean {
  return env[key] !== undefined && env[key] !== '';
}

/**
 * Returns the list of keys from the provided array that are missing or empty in the environment.
 */
export function getMissingKeys(env: ParsedEnv, keys: string[]): string[] {
  return keys.filter((key) => !hasKey(env, key));
}

/**
 * Formats a ValidationResult into a human-readable string.
 */
export function formatValidationErrors(result: ValidationResult): string {
  if (result.valid) return 'All validations passed.';
  return result.errors.map((e) => `  ✖ ${e.message}`).join('\n');
}
