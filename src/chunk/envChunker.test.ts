import { chunkEnv, chunkByPrefix, formatChunkResult } from './envChunker';

const env: Record<string, string> = {
  APP_NAME: 'myapp',
  APP_PORT: '3000',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  REDIS_URL: 'redis://localhost',
};

describe('chunkEnv', () => {
  it('splits env into chunks of given size', () => {
    const chunks = chunkEnv(env, 2);
    expect(chunks).toHaveLength(3);
    expect(Object.keys(chunks[0])).toHaveLength(2);
    expect(Object.keys(chunks[2])).toHaveLength(1);
  });

  it('returns single chunk when size >= total keys', () => {
    const chunks = chunkEnv(env, 10);
    expect(chunks).toHaveLength(1);
  });

  it('throws on invalid size', () => {
    expect(() => chunkEnv(env, 0)).toThrow('Chunk size must be greater than 0');
  });

  it('returns empty array for empty env', () => {
    expect(chunkEnv({}, 2)).toEqual([]);
  });
});

describe('chunkByPrefix', () => {
  it('groups keys by prefix', () => {
    const groups = chunkByPrefix(env);
    expect(groups['APP']).toEqual({ APP_NAME: 'myapp', APP_PORT: '3000' });
    expect(groups['DB']).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
    expect(groups['REDIS']).toEqual({ REDIS_URL: 'redis://localhost' });
  });

  it('uses __default for keys without underscore', () => {
    const groups = chunkByPrefix({ SIMPLE: 'val' });
    expect(groups['__default']).toEqual({ SIMPLE: 'val' });
  });
});

describe('formatChunkResult', () => {
  it('formats chunk result as readable string', () => {
    const chunks = chunkEnv(env, 2);
    const output = formatChunkResult({ chunks, total: 5, chunkSize: 2 });
    expect(output).toContain('Chunked 5 keys');
    expect(output).toContain('Chunk 1');
  });
});
