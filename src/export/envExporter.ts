import { EnvMap } from '../parser/envParser';
import { redactEnv } from '../redact/secretRedactor';
import { serializeEnv } from '../parser/envParser';

export type ExportFormat = 'dotenv' | 'json' | 'shell';

export interface ExportOptions {
  format?: ExportFormat;
  redact?: boolean;
  includeComments?: boolean;
}

export function exportEnv(
  env: EnvMap,
  options: ExportOptions = {}
): string {
  const { format = 'dotenv', redact = false } = options;

  const target = redact ? redactEnv(env) : { ...env };

  switch (format) {
    case 'json':
      return exportAsJson(target);
    case 'shell':
      return exportAsShell(target);
    case 'dotenv':
    default:
      return exportAsDotenv(target);
  }
}

export function exportAsDotenv(env: EnvMap): string {
  return serializeEnv(env);
}

export function exportAsJson(env: EnvMap): string {
  return JSON.stringify(env, null, 2);
}

export function exportAsShell(env: EnvMap): string {
  return Object.entries(env)
    .map(([key, value]) => {
      const escaped = value.replace(/'/g, "'\\''")
      return `export ${key}='${escaped}'`;
    })
    .join('\n');
}

export function parseExportFormat(value: string): ExportFormat {
  if (value === 'json' || value === 'shell' || value === 'dotenv') {
    return value;
  }
  throw new Error(
    `Unsupported export format: "${value}". Use one of: dotenv, json, shell`
  );
}
