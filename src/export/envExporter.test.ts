import {
  exportEnv,
  exportAsDotenv,
  exportAsJson,
  exportAsShell,
  parseExportFormat,
} from './envExporter';
import type { EnvMap } from '../parser/envParser';

const sampleEnv: EnvMap = {
  APP_NAME: 'envoy',
  DATABASE_URL: 'postgres://localhost/db',
  SECRET_KEY: 'supersecret',
  PORT: '3000',
};

describe('exportAsDotenv', () => {
  it('serializes env to dotenv format', () => {
    const result = exportAsDotenv(sampleEnv);
    expect(result).toContain('APP_NAME=envoy');
    expect(result).toContain('PORT=3000');
  });
});

describe('exportAsJson', () => {
  it('serializes env to JSON format', () => {
    const result = exportAsJson(sampleEnv);
    const parsed = JSON.parse(result);
    expect(parsed.APP_NAME).toBe('envoy');
    expect(parsed.PORT).toBe('3000');
  });
});

describe('exportAsShell', () => {
  it('serializes env to shell export statements', () => {
    const result = exportAsShell(sampleEnv);
    expect(result).toContain("export APP_NAME='envoy'");
    expect(result).toContain("export PORT='3000'");
  });

  it('escapes single quotes in values', () => {
    const env: EnvMap = { GREETING: "it's alive" };
    const result = exportAsShell(env);
    expect(result).toContain("export GREETING='it'\\''s alive'");
  });
});

describe('exportEnv', () => {
  it('defaults to dotenv format', () => {
    const result = exportEnv(sampleEnv);
    expect(result).toContain('APP_NAME=envoy');
  });

  it('redacts secrets when redact=true', () => {
    const result = exportEnv(sampleEnv, { redact: true, format: 'json' });
    const parsed = JSON.parse(result);
    expect(parsed.SECRET_KEY).toBe('[REDACTED]');
    expect(parsed.APP_NAME).toBe('envoy');
  });

  it('exports as shell format', () => {
    const result = exportEnv(sampleEnv, { format: 'shell' });
    expect(result).toContain("export APP_NAME='envoy'");
  });
});

describe('parseExportFormat', () => {
  it('returns valid formats', () => {
    expect(parseExportFormat('dotenv')).toBe('dotenv');
    expect(parseExportFormat('json')).toBe('json');
    expect(parseExportFormat('shell')).toBe('shell');
  });

  it('throws on invalid format', () => {
    expect(() => parseExportFormat('yaml')).toThrow('Unsupported export format');
  });
});
