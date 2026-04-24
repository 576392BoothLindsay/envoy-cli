import { splitEnv, splitByDelimiter, formatSplitResult } from './envSplitter';

describe('splitEnv', () => {
  const env = { A: '1', B: '2', C: '3', D: '4', E: '5' };

  it('splits into chunks of given size', () => {
    const result = splitEnv(env, 2);
    expect(result.chunkCount).toBe(3);
    expect(result.totalKeys).toBe(5);
    expect(result.chunks[0]).toEqual({ A: '1', B: '2' });
    expect(result.chunks[1]).toEqual({ C: '3', D: '4' });
    expect(result.chunks[2]).toEqual({ E: '5' });
  });

  it('returns a single chunk when chunkSize >= total keys', () => {
    const result = splitEnv(env, 10);
    expect(result.chunkCount).toBe(1);
    expect(result.chunks[0]).toEqual(env);
  });

  it('handles empty env', () => {
    const result = splitEnv({}, 2);
    expect(result.chunkCount).toBe(1);
    expect(result.chunks[0]).toEqual({});
    expect(result.totalKeys).toBe(0);
  });

  it('throws for chunkSize < 1', () => {
    expect(() => splitEnv(env, 0)).toThrow('chunkSize must be >= 1');
  });

  it('splits into single-key chunks', () => {
    const result = splitEnv({ X: 'a', Y: 'b' }, 1);
    expect(result.chunkCount).toBe(2);
    expect(result.chunks[0]).toEqual({ X: 'a' });
    expect(result.chunks[1]).toEqual({ Y: 'b' });
  });
});

describe('splitByDelimiter', () => {
  it('splits values by comma', () => {
    const env = { HOSTS: 'a,b,c', PORT: '8080' };
    const result = splitByDelimiter(env, ',');
    expect(result.HOSTS).toEqual(['a', 'b', 'c']);
    expect(result.PORT).toEqual(['8080']);
  });

  it('trims whitespace around delimiter', () => {
    const env = { LIST: 'foo , bar , baz' };
    const result = splitByDelimiter(env, ',');
    expect(result.LIST).toEqual(['foo', 'bar', 'baz']);
  });

  it('handles empty env', () => {
    expect(splitByDelimiter({}, ',')).toEqual({});
  });
});

describe('formatSplitResult', () => {
  it('includes chunk headers and summary', () => {
    const result = splitEnv({ A: '1', B: '2' }, 1);
    const formatted = formatSplitResult(result);
    expect(formatted.output).toContain('# --- Chunk 1 ---');
    expect(formatted.output).toContain('# --- Chunk 2 ---');
    expect(formatted.summary).toContain('2 keys into 2 chunk(s)');
  });
});
