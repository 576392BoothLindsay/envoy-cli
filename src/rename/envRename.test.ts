import { renameKey, renameKeys, formatRenameResult } from './envRename';

describe('renameKey', () => {
  const env = { FOO: 'bar', BAZ: 'qux', KEEP: 'me' };

  it('renames an existing key preserving value', () => {
    const result = renameKey(env, 'FOO', 'FOO_NEW');
    expect(result).not.toBeNull();
    expect(result!['FOO_NEW']).toBe('bar');
    expect(result!['FOO']).toBeUndefined();
  });

  it('preserves other keys', () => {
    const result = renameKey(env, 'FOO', 'FOO_NEW');
    expect(result!['BAZ']).toBe('qux');
    expect(result!['KEEP']).toBe('me');
  });

  it('returns null when key does not exist', () => {
    expect(renameKey(env, 'MISSING', 'NEW')).toBeNull();
  });
});

describe('renameKeys', () => {
  const env = { A: '1', B: '2', C: '3' };

  it('renames multiple keys', () => {
    const { env: updated, result } = renameKeys(env, [
      { oldKey: 'A', newKey: 'A_NEW' },
      { oldKey: 'B', newKey: 'B_NEW' },
    ]);
    expect(updated['A_NEW']).toBe('1');
    expect(updated['B_NEW']).toBe('2');
    expect(updated['A']).toBeUndefined();
    expect(result.renamed).toHaveLength(2);
  });

  it('tracks not found keys', () => {
    const { result } = renameKeys(env, [{ oldKey: 'MISSING', newKey: 'X' }]);
    expect(result.notFound).toContain('MISSING');
  });

  it('skips when newKey already exists without overwrite', () => {
    const { result } = renameKeys(env, [{ oldKey: 'A', newKey: 'B' }]);
    expect(result.skipped).toHaveLength(1);
    expect(result.skipped[0].oldKey).toBe('A');
  });

  it('overwrites existing key when overwrite=true', () => {
    const { env: updated, result } = renameKeys(
      env,
      [{ oldKey: 'A', newKey: 'B' }],
      true
    );
    expect(updated['B']).toBe('1');
    expect(result.renamed).toHaveLength(1);
  });
});

describe('formatRenameResult', () => {
  it('formats all sections', () => {
    const output = formatRenameResult({
      renamed: [{ oldKey: 'OLD', newKey: 'NEW' }],
      skipped: [{ oldKey: 'A', newKey: 'B' }],
      notFound: ['GHOST'],
    });
    expect(output).toContain('Renamed:');
    expect(output).toContain('OLD → NEW');
    expect(output).toContain('Skipped');
    expect(output).toContain('A → B');
    expect(output).toContain('Not found:');
    expect(output).toContain('GHOST');
  });

  it('omits empty sections', () => {
    const output = formatRenameResult({ renamed: [], skipped: [], notFound: [] });
    expect(output).toBe('');
  });
});
