import { EnvRecord } from '../parser/envParser';

export type ConvertFormat = 'dotenv' | 'json' | 'yaml' | 'toml' | 'shell' | 'csv';

export interface ConvertResult {
  format: ConvertFormat;
  output: string;
  keyCount: number;
}

export function convertEnv(env: EnvRecord, format: ConvertFormat): ConvertResult {
  let output: string;

  switch (format) {
    case 'dotenv':
      output = toDotenv(env);
      break;
    case 'json':
      output = toJson(env);
      break;
    case 'yaml':
      output = toYaml(env);
      break;
    case 'toml':
      output = toToml(env);
      break;
    case 'shell':
      output = toShell(env);
      break;
    case 'csv':
      output = toCsv(env);
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }

  return {
    format,
    output,
    keyCount: Object.keys(env).length,
  };
}

export function toDotenv(env: EnvRecord): string {
  return Object.entries(env)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
}

export function toJson(env: EnvRecord): string {
  return JSON.stringify(env, null, 2);
}

export function toYaml(env: EnvRecord): string {
  return Object.entries(env)
    .map(([key, value]) => {
      const needsQuotes = /[:#{}\[\],&*?|<>=!%@`]/.test(value) || value.includes('\n');
      return `${key}: ${needsQuotes ? `"${value.replace(/"/g, '\\"')}"` : value}`;
    })
    .join('\n');
}

export function toToml(env: EnvRecord): string {
  return Object.entries(env)
    .map(([key, value]) => `${key} = "${value.replace(/"/g, '\\"')}"`) 
    .join('\n');
}

export function toShell(env: EnvRecord): string {
  return Object.entries(env)
    .map(([key, value]) => `export ${key}="${value.replace(/"/g, '\\"')}"`)
    .join('\n');
}

export function toCsv(env: EnvRecord): string {
  const header = 'key,value';
  const rows = Object.entries(env).map(([key, value]) => {
    const escapedValue = value.includes(',') || value.includes('"') || value.includes('\n')
      ? `"${value.replace(/"/g, '""')}"`
      : value;
    return `${key},${escapedValue}`;
  });
  return [header, ...rows].join('\n');
}

export function parseConvertFormat(input: string): ConvertFormat {
  const valid: ConvertFormat[] = ['dotenv', 'json', 'yaml', 'toml', 'shell', 'csv'];
  if (valid.includes(input as ConvertFormat)) {
    return input as ConvertFormat;
  }
  throw new Error(`Invalid format "${input}". Valid formats: ${valid.join(', ')}`);
}
