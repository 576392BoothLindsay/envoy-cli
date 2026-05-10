import { copyKeys, copyAllKeys, formatCopyResult } from './envCopy';

describe('copyKeys', () => {
  const source = { A: '1', B: '2', C: '3' };
  const destination = { B: 'existing', D: '4' };

  it('copies specified keys from source to destination', () => {
    const result = copyKeys(source, destination, ['A', 'C']);
    expect(result.destination).toMatchObject({ A: '1', B: 'existing', C: '3', D: '4' });
    expect(result.copiedKeys).toEqual(['A', 'C']);
    expect(result.skippedKeys).toEqual([]);
  });

  it('skips keys not present in source', () => {
    const result = copyKeys(source, destination, ['Z']);
    expect(result.copiedKeys).toEqual([]);
    expect(result.skippedKeys).toEqual(['Z']);
  });

  it('skips existing destination keys without overwrite', () => {
    const result = copyKeys(source, destination, ['B']);
    expect(result.destination['B']).toBe('existing');
    expect(result.skippedKeys).toContain('B');
  });

  it('overwrites existing destination keys when overwrite=true', () => {
    const result = copyKeys(source, destination, ['B'], { overwrite: true });
    expect(result.destination['B']).toBe('2');
    expect(result.copiedKeys).toContain('B');
  });

  it('does not mutate source or destination', () => {
    const src = { X: 'x' };
    const dst = { Y: 'y' };
    copyKeys(src, dst, ['X']);
    expect(dst).toEqual({ Y: 'y' });
  });
});

describe('copyAllKeys', () => {
  it('copies all keys from source', () => {
    const result = copyAllKeys({ A: '1', B: '2' }, { C: '3' });
    expect(result.destination).toMatchObject({ A: '1', B: '2', C: '3' });
    expect(result.copiedKeys).toEqual(['A', 'B']);
  });

  it('respects overwrite option', () => {
    const result = copyAllKeys({ A: 'new' }, { A: 'old' }, { overwrite: true });
    expect(result.destination['A']).toBe('new');
  });
});

describe('formatCopyResult', () => {
  it('formats copied and skipped keys', () => {
    const result = copyKeys({ A: '1', B: '2' }, { B: 'x' }, ['A', 'B']);
    const output = formatCopyResult(result);
    expect(output).toContain('Copied');
    expect(output).toContain('Skipped');
  });

  it('returns nothing copied message when empty', () => {
    const result = copyKeys({}, {}, []);
    const output = formatCopyResult(result);
    expect(output).toBe('Nothing copied.');
  });
});
