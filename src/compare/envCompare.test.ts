import { compareEnvs, formatCompareResult } from './envCompare';

const source = {
  APP_NAME: 'envoy',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  SECRET_KEY: 'abc123',
};

const target = {
  APP_NAME: 'envoy',
  DB_HOST: 'prod.db.example.com',
  DB_PORT: '5432',
  EXTRA_KEY: 'extra',
};

describe('compareEnvs', () => {
  it('identifies matching keys', () => {
    const result = compareEnvs(source, target);
    expect(result.matching).toContain('APP_NAME');
    expect(result.matching).toContain('DB_PORT');
  });

  it('identifies value conflicts', () => {
    const result = compareEnvs(source, target);
    const conflict = result.valueConflicts.find((c) => c.key === 'DB_HOST');
    expect(conflict).toBeDefined();
    expect(conflict?.sourceValue).toBe('localhost');
    expect(conflict?.targetValue).toBe('prod.db.example.com');
  });

  it('identifies keys missing in target', () => {
    const result = compareEnvs(source, target);
    expect(result.missingInTarget).toContain('SECRET_KEY');
  });

  it('identifies extra keys in target', () => {
    const result = compareEnvs(source, target);
    expect(result.extraInTarget).toContain('EXTRA_KEY');
  });

  it('returns correct summary counts', () => {
    const result = compareEnvs(source, target);
    expect(result.summary.total).toBe(4);
    expect(result.summary.matching).toBe(2);
    expect(result.summary.conflicts).toBe(1);
    expect(result.summary.missing).toBe(1);
    expect(result.summary.extra).toBe(1);
  });

  it('handles identical envs', () => {
    const result = compareEnvs(source, source);
    expect(result.matching.length).toBe(4);
    expect(result.valueConflicts.length).toBe(0);
    expect(result.missingInTarget.length).toBe(0);
    expect(result.extraInTarget.length).toBe(0);
  });

  it('handles empty source', () => {
    const result = compareEnvs({}, target);
    expect(result.summary.total).toBe(0);
    expect(result.extraInTarget.length).toBe(Object.keys(target).length);
  });
});

describe('formatCompareResult', () => {
  it('includes summary line', () => {
    const result = compareEnvs(source, target);
    const output = formatCompareResult(result);
    expect(output).toContain('Summary:');
    expect(output).toContain('Matching:');
  });

  it('includes conflict details', () => {
    const result = compareEnvs(source, target);
    const output = formatCompareResult(result);
    expect(output).toContain('DB_HOST');
    expect(output).toContain('localhost');
    expect(output).toContain('prod.db.example.com');
  });

  it('includes missing keys section', () => {
    const result = compareEnvs(source, target);
    const output = formatCompareResult(result);
    expect(output).toContain('Missing in target');
    expect(output).toContain('SECRET_KEY');
  });
});
