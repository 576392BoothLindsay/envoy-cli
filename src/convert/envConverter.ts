import { EnvRecord } from '../parser/envParser';

export type ConvertFormat = 'dotenv' | 'json' | 'yaml' | 'toml';

export interface ConvertResult {
  format: ConvertFormat;
  output: string;
  keyCount: number;
}

export function convertEnv(env: EnvRecord, format: ConvertFormat): ConvertResult {
  const keyCount = Object.keys(env).length;
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
    default:
      throw new Error(`Unsupported format: ${format}`);
  }

  return { format, output, keyCount };
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
      const yamlValue = needsQuotes ? `"${value.replace(/"/g, '\\"')}"` : value;
      return `${key}: ${yamlValue}`;
    })
    .join('\n');
}

export function toToml(env: EnvRecord): string {
  return Object.entries(env)
    .map(([key, value]) => `${key} = "${value.replace(/"/g, '\\"')}"`)
    .join('\n');
}

export function parseConvertFormat(input: string): ConvertFormat {
  const normalized = input.toLowerCase().trim();
  const valid: ConvertFormat[] = ['dotenv', 'json', 'yaml', 'toml'];
  if (!valid.includes(normalized as ConvertFormat)) {
    throw new Error(`Invalid format "${input}". Valid formats: ${valid.join(', ')}`);
  }
  return normalized as ConvertFormat;
}

export function formatConvertResult(result: ConvertResult): string {
  return `Converted ${result.keyCount} key(s) to ${result.format} format.\n\n${result.output}`;
}
