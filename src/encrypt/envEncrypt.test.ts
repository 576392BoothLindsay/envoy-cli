import {
  encryptValue,
  decryptValue,
  isEncrypted,
  encryptEnv,
  decryptEnv,
  formatEncryptResult,
} from './envEncrypt';

const PASSPHRASE = 'test-passphrase-123';

describe('isEncrypted', () => {
  it('returns true for encrypted values', () => {
    const encrypted = encryptValue('hello', PASSPHRASE);
    expect(isEncrypted(encrypted)).toBe(true);
  });

  it('returns false for plain values', () => {
    expect(isEncrypted('plain-value')).toBe(false);
    expect(isEncrypted('enc:')).toBe(false);
  });
});

describe('encryptValue / decryptValue', () => {
  it('encrypts and decrypts a value round-trip', () => {
    const original = 'super-secret';
    const encrypted = encryptValue(original, PASSPHRASE);
    expect(encrypted).not.toBe(original);
    expect(isEncrypted(encrypted)).toBe(true);
    const decrypted = decryptValue(encrypted, PASSPHRASE);
    expect(decrypted).toBe(original);
  });

  it('decryptValue returns plain value if not encrypted', () => {
    expect(decryptValue('plain', PASSPHRASE)).toBe('plain');
  });

  it('throws on malformed encrypted value', () => {
    expect(() => decryptValue('enc:badformat', PASSPHRASE)).toThrow();
  });

  it('produces different ciphertext each call (random IV)', () => {
    const a = encryptValue('same', PASSPHRASE);
    const b = encryptValue('same', PASSPHRASE);
    expect(a).not.toBe(b);
  });
});

describe('encryptEnv', () => {
  const env = { DB_PASS: 'secret', API_KEY: 'key123', NODE_ENV: 'production' };

  it('encrypts all keys when no target keys specified', () => {
    const { encrypted, encryptedKeys, skippedKeys } = encryptEnv(env, PASSPHRASE);
    expect(encryptedKeys).toHaveLength(3);
    expect(skippedKeys).toHaveLength(0);
    expect(isEncrypted(encrypted['DB_PASS'])).toBe(true);
  });

  it('encrypts only specified keys', () => {
    const { encryptedKeys, skippedKeys } = encryptEnv(env, PASSPHRASE, ['DB_PASS']);
    expect(encryptedKeys).toEqual(['DB_PASS']);
    expect(skippedKeys).toHaveLength(0);
  });

  it('skips already-encrypted values', () => {
    const preEncrypted = { ...env, DB_PASS: encryptValue('secret', PASSPHRASE) };
    const { skippedKeys } = encryptEnv(preEncrypted, PASSPHRASE, ['DB_PASS']);
    expect(skippedKeys).toContain('DB_PASS');
  });

  it('skips missing keys', () => {
    const { skippedKeys } = encryptEnv(env, PASSPHRASE, ['MISSING_KEY']);
    expect(skippedKeys).toContain('MISSING_KEY');
  });
});

describe('decryptEnv', () => {
  it('decrypts all encrypted values in env', () => {
    const { encrypted } = encryptEnv({ A: 'val1', B: 'val2' }, PASSPHRASE);
    const decrypted = decryptEnv(encrypted, PASSPHRASE);
    expect(decrypted).toEqual({ A: 'val1', B: 'val2' });
  });

  it('leaves plain values unchanged', () => {
    const env = { A: 'plain', B: encryptValue('secret', PASSPHRASE) };
    const decrypted = decryptEnv(env, PASSPHRASE);
    expect(decrypted.A).toBe('plain');
    expect(decrypted.B).toBe('secret');
  });
});

describe('formatEncryptResult', () => {
  it('formats encrypted and skipped keys', () => {
    const result = { encrypted: {}, encryptedKeys: ['A', 'B'], skippedKeys: ['C'] };
    const output = formatEncryptResult(result);
    expect(output).toContain('Encrypted (2)');
    expect(output).toContain('Skipped (1)');
  });

  it('omits empty sections', () => {
    const result = { encrypted: {}, encryptedKeys: ['A'], skippedKeys: [] };
    const output = formatEncryptResult(result);
    expect(output).not.toContain('Skipped');
  });
});
