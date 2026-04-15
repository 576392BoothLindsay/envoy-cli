import { groupByPrefix, flattenGroups, formatGroupResult } from './envGroup';

const sampleEnv = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_NAME: 'mydb',
  APP_PORT: '3000',
  APP_ENV: 'production',
  SECRET: 'abc123',
};

describe('groupByPrefix', () => {
  it('groups keys by underscore prefix', () => {
    const result = groupByPrefix(sampleEnv);
    expect(result.groups['DB']).toEqual({
      HOST: 'localhost',
      PORT: '5432',
      NAME: 'mydb',
    });
    expect(result.groups['APP']).toEqual({
      PORT: '3000',
      ENV: 'production',
    });
  });

  it('places keys without delimiter into ungrouped', () => {
    const result = groupByPrefix(sampleEnv);
    expect(result.ungrouped).toEqual({ SECRET: 'abc123' });
  });

  it('supports custom delimiter', () => {
    const env = { 'DB.HOST': 'localhost', 'DB.PORT': '5432', PLAIN: 'val' };
    const result = groupByPrefix(env, '.');
    expect(result.groups['DB']).toEqual({ HOST: 'localhost', PORT: '5432' });
    expect(result.ungrouped).toEqual({ PLAIN: 'val' });
  });

  it('returns empty groups for empty env', () => {
    const result = groupByPrefix({});
    expect(result.groups).toEqual({});
    expect(result.ungrouped).toEqual({});
  });
});

describe('flattenGroups', () => {
  it('reconstructs original flat env from grouped result', () => {
    const result = groupByPrefix(sampleEnv);
    const flat = flattenGroups(result);
    expect(flat).toEqual(sampleEnv);
  });

  it('handles empty groups', () => {
    const flat = flattenGroups({ groups: {}, ungrouped: { FOO: 'bar' } });
    expect(flat).toEqual({ FOO: 'bar' });
  });
});

describe('formatGroupResult', () => {
  it('formats groups with headers', () => {
    const result = groupByPrefix({ DB_HOST: 'localhost', SECRET: 'x' });
    const output = formatGroupResult(result);
    expect(output).toContain('[DB]');
    expect(output).toContain('HOST=localhost');
    expect(output).toContain('[ungrouped]');
    expect(output).toContain('SECRET=x');
  });

  it('hides ungrouped when showUngrouped is false', () => {
    const result = groupByPrefix({ DB_HOST: 'localhost', SECRET: 'x' });
    const output = formatGroupResult(result, { showUngrouped: false });
    expect(output).not.toContain('[ungrouped]');
    expect(output).not.toContain('SECRET');
  });
});
