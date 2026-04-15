import { cloneEnv, formatCloneResult } from './envClone';

describe('cloneEnv', () => {
  const source = {
    APP_HOST: 'localhost',
    APP_PORT: '3000',
    DB_URL: 'postgres://localhost/dev',
    SECRET_KEY: 'abc123',
  };

  it('clones env without options', () => {
    const result = cloneEnv(source);
    expect(result.cloned).toEqual(source);
    expect(result.skippedKeys).toHaveLength(0);
    expect(result.addedKeys).toHaveLength(4);
  });

  it('adds prefix to all keys', () => {
    const result = cloneEnv(source, { prefix: 'STAGING_' });
    expect(result.cloned['STAGING_APP_HOST']).toBe('localhost');
    expect(result.cloned['STAGING_DB_URL']).toBe('postgres://localhost/dev');
    expect(result.cloned['APP_HOST']).toBeUndefined();
  });

  it('strips prefix from keys', () => {
    const result = cloneEnv(source, { stripPrefix: 'APP_' });
    expect(result.cloned['HOST']).toBe('localhost');
    expect(result.cloned['PORT']).toBe('3000');
    expect(result.cloned['APP_HOST']).toBeUndefined();
  });

  it('strips and adds prefix together', () => {
    const result = cloneEnv(source, { stripPrefix: 'APP_', prefix: 'WEB_' });
    expect(result.cloned['WEB_HOST']).toBe('localhost');
    expect(result.cloned['WEB_PORT']).toBe('3000');
  });

  it('excludes specified keys', () => {
    const result = cloneEnv(source, { exclude: ['SECRET_KEY', 'DB_URL'] });
    expect(result.cloned['SECRET_KEY']).toBeUndefined();
    expect(result.cloned['DB_URL']).toBeUndefined();
    expect(result.skippedKeys).toEqual(['SECRET_KEY', 'DB_URL']);
  });

  it('applies overrides after cloning', () => {
    const result = cloneEnv(source, { overrides: { APP_PORT: '8080', NEW_KEY: 'value' } });
    expect(result.cloned['APP_PORT']).toBe('8080');
    expect(result.cloned['NEW_KEY']).toBe('value');
  });

  it('preserves original record unchanged', () => {
    cloneEnv(source, { prefix: 'X_', exclude: ['APP_HOST'] });
    expect(source['APP_HOST']).toBe('localhost');
  });
});

describe('formatCloneResult', () => {
  it('formats result with skipped keys', () => {
    const result = cloneEnv(
      { A: '1', B: '2', C: '3' },
      { exclude: ['B'] }
    );
    const output = formatCloneResult(result);
    expect(output).toContain('2 key(s)');
    expect(output).toContain('Skipped: B');
  });

  it('formats result without skipped keys', () => {
    const result = cloneEnv({ A: '1', B: '2' });
    const output = formatCloneResult(result);
    expect(output).toContain('2 key(s)');
    expect(output).not.toContain('Skipped');
  });
});
