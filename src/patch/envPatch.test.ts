import { applyPatch, parsePatchOperations, formatPatchResult, PatchOperation } from './envPatch';

describe('applyPatch', () => {
  const base = { FOO: 'foo', BAR: 'bar', BAZ: 'baz' };

  it('applies set operations', () => {
    const ops: PatchOperation[] = [{ op: 'set', key: 'FOO', value: 'updated' }];
    const { patched } = applyPatch(base, ops);
    expect(patched.FOO).toBe('updated');
  });

  it('applies delete operations', () => {
    const ops: PatchOperation[] = [{ op: 'delete', key: 'BAR' }];
    const { patched } = applyPatch(base, ops);
    expect(patched).not.toHaveProperty('BAR');
  });

  it('applies rename operations', () => {
    const ops: PatchOperation[] = [{ op: 'rename', from: 'BAZ', to: 'QUX' }];
    const { patched } = applyPatch(base, ops);
    expect(patched).not.toHaveProperty('BAZ');
    expect(patched.QUX).toBe('baz');
  });

  it('skips delete on missing key', () => {
    const ops: PatchOperation[] = [{ op: 'delete', key: 'MISSING' }];
    const { applied, skipped } = applyPatch(base, ops);
    expect(applied).toHaveLength(0);
    expect(skipped).toHaveLength(1);
  });

  it('skips rename on missing key', () => {
    const ops: PatchOperation[] = [{ op: 'rename', from: 'MISSING', to: 'NEW' }];
    const { skipped } = applyPatch(base, ops);
    expect(skipped).toHaveLength(1);
  });

  it('does not mutate the original env', () => {
    const ops: PatchOperation[] = [{ op: 'set', key: 'FOO', value: 'changed' }];
    applyPatch(base, ops);
    expect(base.FOO).toBe('foo');
  });
});

describe('parsePatchOperations', () => {
  it('parses set operations', () => {
    const ops = parsePatchOperations('KEY=value');
    expect(ops).toEqual([{ op: 'set', key: 'KEY', value: 'value' }]);
  });

  it('parses delete operations', () => {
    const ops = parsePatchOperations('- KEY');
    expect(ops).toEqual([{ op: 'delete', key: 'KEY' }]);
  });

  it('parses rename operations', () => {
    const ops = parsePatchOperations('OLD -> NEW');
    expect(ops).toEqual([{ op: 'rename', from: 'OLD', to: 'NEW' }]);
  });

  it('ignores comments and blank lines', () => {
    const ops = parsePatchOperations('# comment\n\nKEY=val');
    expect(ops).toHaveLength(1);
  });

  it('throws on invalid line', () => {
    expect(() => parsePatchOperations('INVALID_LINE_NO_EQUALS')).toThrow();
  });
});

describe('formatPatchResult', () => {
  it('formats result with skipped ops', () => {
    const result = {
      patched: {},
      applied: [{ op: 'set' as const, key: 'A', value: 'b' }],
      skipped: [{ op: 'delete' as const, key: 'MISSING' }],
    };
    const output = formatPatchResult(result);
    expect(output).toContain('Applied: 1');
    expect(output).toContain('Skipped: 1');
    expect(output).toContain('delete MISSING');
  });
});
