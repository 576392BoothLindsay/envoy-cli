import { diffEnv, formatDiff } from './envDiff';

describe('diffEnv', () => {
  const base = { APP_NAME: 'myapp', PORT: '3000', SECRET: 'abc123' };
  const target = { APP_NAME: 'myapp', PORT: '4000', API_KEY: 'xyz789' };

  it('detects added keys', () => {
    const result = diffEnv(base, target);
    const added = result.entries.filter(e => e.status === 'added');
    expect(added).toHaveLength(1);
    expect(added[0].key).toBe('API_KEY');
    expect(added[0].newValue).toBe('xyz789');
  });

  it('detects removed keys', () => {
    const result = diffEnv(base, target);
    const removed = result.entries.filter(e => e.status === 'removed');
    expect(removed).toHaveLength(1);
    expect(removed[0].key).toBe('SECRET');
    expect(removed[0].oldValue).toBe('abc123');
  });

  it('detects changed keys', () => {
    const result = diffEnv(base, target);
    const changed = result.entries.filter(e => e.status === 'changed');
    expect(changed).toHaveLength(1);
    expect(changed[0].key).toBe('PORT');
    expect(changed[0].oldValue).toBe('3000');
    expect(changed[0].newValue).toBe('4000');
  });

  it('detects unchanged keys', () => {
    const result = diffEnv(base, target);
    const unchanged = result.entries.filter(e => e.status === 'unchanged');
    expect(unchanged).toHaveLength(1);
    expect(unchanged[0].key).toBe('APP_NAME');
  });

  it('sets hasChanges to true when differences exist', () => {
    const result = diffEnv(base, target);
    expect(result.hasChanges).toBe(true);
  });

  it('sets hasChanges to false for identical maps', () => {
    const result = diffEnv(base, { ...base });
    expect(result.hasChanges).toBe(false);
  });

  it('returns correct summary counts', () => {
    const result = diffEnv(base, target);
    expect(result.summary.added).toBe(1);
    expect(result.summary.removed).toBe(1);
    expect(result.summary.changed).toBe(1);
    expect(result.summary.unchanged).toBe(1);
  });

  it('returns sorted keys', () => {
    const result = diffEnv(base, target);
    const keys = result.entries.map(e => e.key);
    expect(keys).toEqual([...keys].sort());
  });
});

describe('formatDiff', () => {
  it('formats added, removed, and changed entries', () => {
    const result = diffEnv({ PORT: '3000', OLD: 'yes' }, { PORT: '4000', NEW: 'yes' });
    const output = formatDiff(result);
    expect(output).toContain('+ NEW=yes');
    expect(output).toContain('- OLD=yes');
    expect(output).toContain('~ PORT: 3000 → 4000');
  });

  it('hides unchanged entries by default', () => {
    const result = diffEnv({ KEY: 'same' }, { KEY: 'same' });
    const output = formatDiff(result);
    expect(output).not.toContain('KEY=same');
    expect(output).toContain('No differences found.');
  });

  it('shows unchanged entries when flag is set', () => {
    const result = diffEnv({ KEY: 'same' }, { KEY: 'same' });
    const output = formatDiff(result, true);
    expect(output).toContain('  KEY=same');
  });
});
