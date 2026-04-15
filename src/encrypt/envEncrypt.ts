import * as crypto from 'crypto';

export interface EncryptOptions {
  algorithm?: string;
  encoding?: BufferEncoding;
}

export interface EncryptResult {
  encrypted: Record<string, string>;
  encryptedKeys: string[];
  skippedKeys: string[];
}

const DEFAULT_ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

export function deriveKey(passphrase: string): Buffer {
  return crypto.scryptSync(passphrase, 'envoy-salt', 32);
}

export function encryptValue(value: string, passphrase: string, opts: EncryptOptions = {}): string {
  const algorithm = opts.algorithm ?? DEFAULT_ALGORITHM;
  const key = deriveKey(passphrase);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return `enc:${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptValue(value: string, passphrase: string, opts: EncryptOptions = {}): string {
  if (!value.startsWith('enc:')) {
    return value;
  }
  const algorithm = opts.algorithm ?? DEFAULT_ALGORITHM;
  const parts = value.split(':');
  if (parts.length !== 3) {
    throw new Error(`Invalid encrypted value format: ${value}`);
  }
  const iv = Buffer.from(parts[1], 'hex');
  const encrypted = Buffer.from(parts[2], 'hex');
  const key = deriveKey(passphrase);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

export function isEncrypted(value: string): boolean {
  return value.startsWith('enc:') && value.split(':').length === 3;
}

export function encryptEnv(
  env: Record<string, string>,
  passphrase: string,
  keys?: string[],
  opts: EncryptOptions = {}
): EncryptResult {
  const result: Record<string, string> = { ...env };
  const encryptedKeys: string[] = [];
  const skippedKeys: string[] = [];

  const targetKeys = keys ?? Object.keys(env);

  for (const key of targetKeys) {
    if (!(key in env)) {
      skippedKeys.push(key);
      continue;
    }
    if (isEncrypted(env[key])) {
      skippedKeys.push(key);
      continue;
    }
    result[key] = encryptValue(env[key], passphrase, opts);
    encryptedKeys.push(key);
  }

  return { encrypted: result, encryptedKeys, skippedKeys };
}

export function decryptEnv(
  env: Record<string, string>,
  passphrase: string,
  opts: EncryptOptions = {}
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = isEncrypted(value) ? decryptValue(value, passphrase, opts) : value;
  }
  return result;
}

export function formatEncryptResult(result: EncryptResult): string {
  const lines: string[] = [];
  if (result.encryptedKeys.length > 0) {
    lines.push(`Encrypted (${result.encryptedKeys.length}): ${result.encryptedKeys.join(', ')}`);
  }
  if (result.skippedKeys.length > 0) {
    lines.push(`Skipped (${result.skippedKeys.length}): ${result.skippedKeys.join(', ')}`);
  }
  return lines.join('\n');
}
