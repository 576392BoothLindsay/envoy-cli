import { auditEnv, formatAuditResult } from './envAudit';

describe('auditEnv', () => {
  it('returns no entries for a clean env', () => {
    const result = auditEnv({ APP_NAME: 'myapp', PORT: '3000' });
    expect(result.entries).toHaveLength(0);
    expect(result.hasErrors).toBe(false);
    expect(result.hasWarnings).toBe(false);
  });

  it('detects empty values', () => {
    const result = auditEnv({ API_URL: '' });
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].issue).toBe('empty_value');
    expect(result.entries[0].severity).toBe('warn');
  });

  it('detects exposed secrets', () => {
    const result = auditEnv({ SECRET_KEY: 'super_secret_value_123' });
    const secretEntry = result.entries.find((e) => e.issue === 'secret_exposed');
    expect(secretEntry).toBeDefined();
    expect(secretEntry?.severity).toBe('error');
    expect(result.hasErrors).toBe(true);
  });

  it('does not flag redacted secret values', () => {
    const result = auditEnv({ SECRET_KEY: '***' });
    const secretEntry = result.entries.find((e) => e.issue === 'secret_exposed');
    expect(secretEntry).toBeUndefined();
  });

  it('detects invalid key format', () => {
    const result = auditEnv({ 'my-key': 'value' });
    const formatEntry = result.entries.find((e) => e.issue === 'invalid_format');
    expect(formatEntry).toBeDefined();
    expect(formatEntry?.severity).toBe('warn');
  });

  it('detects duplicate keys from raw lines', () => {
    const rawLines = ['APP_NAME=foo', 'PORT=3000', 'APP_NAME=bar'];
    const result = auditEnv({ APP_NAME: 'bar', PORT: '3000' }, rawLines);
    const dupEntry = result.entries.find((e) => e.issue === 'duplicate_key');
    expect(dupEntry).toBeDefined();
    expect(dupEntry?.key).toBe('APP_NAME');
  });

  it('does not report duplicates when there are none', () => {
    const rawLines = ['APP_NAME=foo', 'PORT=3000'];
    const result = auditEnv({ APP_NAME: 'foo', PORT: '3000' }, rawLines);
    const dupEntry = result.entries.find((e) => e.issue === 'duplicate_key');
    expect(dupEntry).toBeUndefined();
  });
});

describe('formatAuditResult', () => {
  it('returns success message for empty entries', () => {
    const output = formatAuditResult({ entries: [], hasErrors: false, hasWarnings: false });
    expect(output).toBe('✔ No issues found.');
  });

  it('formats error and warning entries', () => {
    const result = auditEnv({ SECRET_KEY: 'plaintext', 'bad-key': '' });
    const output = formatAuditResult(result);
    expect(output).toContain('[ERROR]');
    expect(output).toContain('[WARN]');
  });
});
