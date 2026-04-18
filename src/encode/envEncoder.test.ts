import { encodeValue, decodeValue, encodeEnv, decodeEnv, formatEncodeResult } from './envEncoder';

describe('encodeValue', () => {
  it('encodes to base64', () => {
    expect(encodeValue('hello', 'base64')).toBe('aGVsbG8=');
  });

  it('encodes to hex', () => {
    expect(encodeValue('hello', 'hex')).toBe('68656c6c6f');
  });

  it('encodes to uri', () => {
    expect(encodeValue('hello world', 'uri')).toBe('hello%20world');
  });

  it('throws on unknown format', () => {
    expect(() => encodeValue('x', 'unknown' as any)).toThrow();
  });
});

describe('decodeValue', () => {
  it('decodes base64', () => {
    expect(decodeValue('aGVsbG8=', 'base64')).toBe('hello');
  });

  it('decodes hex', () => {
    expect(decodeValue('68656c6c6f', 'hex')).toBe('hello');
  });

  it('decodes uri', () => {
    expect(decodeValue('hello%20world', 'uri')).toBe('hello world');
  });
});

describe('encodeEnv', () => {
  const env = { FOO: 'bar', BAZ: 'qux' };

  it('encodes specified keys', () => {
    const result = encodeEnv(env, ['FOO'], 'base64');
    expect(result.encoded.FOO).toBe(Buffer.from('bar').toString('base64'));
    expect(result.encoded.BAZ).toBe('qux');
    expect(result.skipped).toEqual([]);
  });

  it('tracks skipped keys', () => {
    const result = encodeEnv(env, ['MISSING'], 'hex');
    expect(result.skipped).toContain('MISSING');
  });

  it('does not mutate original env', () => {
    encodeEnv(env, ['FOO'], 'base64');
    expect(env.FOO).toBe('bar');
  });
});

describe('decodeEnv', () => {
  it('decodes specified keys', () => {
    const encoded = { FOO: Buffer.from('bar').toString('base64'), BAZ: 'qux' };
    const result = decodeEnv(encoded, ['FOO'], 'base64');
    expect(result.encoded.FOO).toBe('bar');
  });
});

describe('formatEncodeResult', () => {
  it('formats result with format and count', () => {
    const result = { encoded: { A: 'x', B: 'y' }, skipped: [], format: 'base64' as const };
    const output = formatEncodeResult(result);
    expect(output).toContain('base64');
    expect(output).toContain('2');
  });

  it('includes skipped keys', () => {
    const result = { encoded: { A: 'x' }, skipped: ['MISSING'], format: 'hex' as const };
    const output = formatEncodeResult(result);
    expect(output).toContain('MISSING');
  });
});
