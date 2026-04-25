import { indentEnv, formatIndentResult } from './envIndenter';
import { EnvRecord } from '../parser/envParser';

const sampleEnv: EnvRecord = {
  APP_NAME: 'envoy',
  APP_PORT: '3000',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  SECRET_KEY: 'abc123',
};

describe('indentEnv', () => {
  it('indents with spaces by default', () => {
    const result = indentEnv(sampleEnv);
    expect(result.output).toContain('  APP_NAME=envoy');
    expect(result.keyCount).toBe(5);
    expect(result.groupCount).toBe(1);
  });

  it('indents with tabs', () => {
    const result = indentEnv(sampleEnv, { style: 'tab', size: 1 });
    expect(result.output).toContain('\tAPP_NAME=envoy');
  });

  it('indents with custom space size', () => {
    const result = indentEnv(sampleEnv, { style: 'space', size: 4 });
    expect(result.output).toContain('    APP_NAME=envoy');
  });

  it('groups by prefix when option is set', () => {
    const result = indentEnv(sampleEnv, { groupByPrefix: true });
    expect(result.output).toContain('# APP');
    expect(result.output).toContain('# DB');
    expect(result.output).toContain('# SECRET');
    expect(result.groupCount).toBe(3);
    expect(result.keyCount).toBe(5);
  });

  it('handles keys without underscore as ungrouped', () => {
    const env: EnvRecord = { PORT: '8080', HOST: 'localhost' };
    const result = indentEnv(env, { groupByPrefix: true });
    expect(result.output).not.toContain('# __ungrouped__');
    expect(result.groupCount).toBe(1);
  });

  it('returns empty output for empty env', () => {
    const result = indentEnv({});
    expect(result.output).toBe('');
    expect(result.keyCount).toBe(0);
  });
});

describe('formatIndentResult', () => {
  it('appends summary comment to output', () => {
    const result = indentEnv(sampleEnv);
    const formatted = formatIndentResult(result);
    expect(formatted).toContain('# Indented 5 key(s) across 1 group(s).');
    expect(formatted).toContain('  APP_NAME=envoy');
  });
});
