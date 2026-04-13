import { EnvMap } from '../parser/envParser';
import { shouldRedact } from '../redact/secretRedactor';

export interface AuditEntry {
  key: string;
  issue: 'empty_value' | 'secret_exposed' | 'duplicate_key' | 'invalid_format';
  severity: 'warn' | 'error';
  message: string;
}

export interface AuditResult {
  entries: AuditEntry[];
  hasErrors: boolean;
  hasWarnings: boolean;
}

export function auditEnv(env: EnvMap, rawLines?: string[]): AuditResult {
  const entries: AuditEntry[] = [];

  for (const [key, value] of Object.entries(env)) {
    if (value === '') {
      entries.push({
        key,
        issue: 'empty_value',
        severity: 'warn',
        message: `Key "${key}" has an empty value.`,
      });
    }

    if (shouldRedact(key) && value.length > 0 && !isRedacted(value)) {
      entries.push({
        key,
        issue: 'secret_exposed',
        severity: 'error',
        message: `Key "${key}" appears to contain a secret with a plaintext value.`,
      });
    }

    if (!/^[A-Z_][A-Z0-9_]*$/i.test(key)) {
      entries.push({
        key,
        issue: 'invalid_format',
        severity: 'warn',
        message: `Key "${key}" does not follow the recommended naming convention (A-Z, 0-9, underscore).`,
      });
    }
  }

  if (rawLines) {
    const seen = new Set<string>();
    for (const line of rawLines) {
      const match = line.match(/^([^#=\s][^=]*)=/);
      if (match) {
        const key = match[1].trim();
        if (seen.has(key)) {
          entries.push({
            key,
            issue: 'duplicate_key',
            severity: 'warn',
            message: `Key "${key}" is defined more than once.`,
          });
        }
        seen.add(key);
      }
    }
  }

  return {
    entries,
    hasErrors: entries.some((e) => e.severity === 'error'),
    hasWarnings: entries.some((e) => e.severity === 'warn'),
  };
}

function isRedacted(value: string): boolean {
  return value === '***' || value === '[REDACTED]' || value.startsWith('****');
}

export function formatAuditResult(result: AuditResult): string {
  if (result.entries.length === 0) {
    return '✔ No issues found.';
  }
  const lines = result.entries.map((e) => {
    const icon = e.severity === 'error' ? '✖' : '⚠';
    return `${icon} [${e.severity.toUpperCase()}] ${e.message}`;
  });
  return lines.join('\n');
}
