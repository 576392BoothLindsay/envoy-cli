import { EnvRecord } from '../parser/envParser';

export type LintSeverity = 'error' | 'warning' | 'info';

export interface LintRule {
  id: string;
  description: string;
  severity: LintSeverity;
}

export interface LintIssue {
  rule: string;
  severity: LintSeverity;
  key?: string;
  message: string;
}

export interface LintResult {
  issues: LintIssue[];
  errorCount: number;
  warningCount: number;
  infoCount: number;
  passed: boolean;
}

const RULES: LintRule[] = [
  { id: 'no-empty-value', description: 'Keys should not have empty values', severity: 'warning' },
  { id: 'uppercase-keys', description: 'Keys should be uppercase', severity: 'warning' },
  { id: 'no-spaces-in-keys', description: 'Keys should not contain spaces', severity: 'error' },
  { id: 'no-special-chars', description: 'Keys should only contain alphanumeric chars and underscores', severity: 'error' },
  { id: 'no-leading-digit', description: 'Keys should not start with a digit', severity: 'error' },
  { id: 'no-duplicate-prefix', description: 'Avoid ambiguous duplicate-prefix keys', severity: 'info' },
];

export function lintEnv(env: EnvRecord): LintResult {
  const issues: LintIssue[] = [];

  for (const [key, value] of Object.entries(env)) {
    if (/\s/.test(key)) {
      issues.push({ rule: 'no-spaces-in-keys', severity: 'error', key, message: `Key "${key}" contains spaces` });
    }
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      if (!/\s/.test(key)) {
        issues.push({ rule: 'no-special-chars', severity: 'error', key, message: `Key "${key}" contains invalid characters` });
      }
    }
    if (/^\d/.test(key)) {
      issues.push({ rule: 'no-leading-digit', severity: 'error', key, message: `Key "${key}" starts with a digit` });
    }
    if (key !== key.toUpperCase()) {
      issues.push({ rule: 'uppercase-keys', severity: 'warning', key, message: `Key "${key}" is not uppercase` });
    }
    if (value.trim() === '') {
      issues.push({ rule: 'no-empty-value', severity: 'warning', key, message: `Key "${key}" has an empty value` });
    }
  }

  const keys = Object.keys(env);
  const prefixCounts: Record<string, number> = {};
  for (const key of keys) {
    const prefix = key.split('_')[0];
    prefixCounts[prefix] = (prefixCounts[prefix] ?? 0) + 1;
  }
  for (const [prefix, count] of Object.entries(prefixCounts)) {
    if (count > 10) {
      issues.push({ rule: 'no-duplicate-prefix', severity: 'info', message: `Prefix "${prefix}_" is used by ${count} keys` });
    }
  }

  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const infoCount = issues.filter(i => i.severity === 'info').length;

  return { issues, errorCount, warningCount, infoCount, passed: errorCount === 0 };
}

export function formatLintResult(result: LintResult): string {
  if (result.issues.length === 0) {
    return '✅ No lint issues found.';
  }
  const lines: string[] = [];
  for (const issue of result.issues) {
    const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️ ' : 'ℹ️ ';
    const location = issue.key ? ` [${issue.key}]` : '';
    lines.push(`${icon} [${issue.rule}]${location}: ${issue.message}`);
  }
  lines.push('');
  lines.push(`Errors: ${result.errorCount}, Warnings: ${result.warningCount}, Info: ${result.infoCount}`);
  return lines.join('\n');
}

export function getAvailableRules(): LintRule[] {
  return [...RULES];
}
