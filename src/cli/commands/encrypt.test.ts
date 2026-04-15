import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { createCli } from '../index';

function writeTempEnv(content: string): string {
  const tmpFile = path.join(os.tmpdir(), `envoy-encrypt-test-${Date.now()}.env`);
  fs.writeFileSync(tmpFile, content, 'utf8');
  return tmpFile;
}

function cleanup(...files: string[]) {
  files.forEach((f) => { try { fs.unlinkSync(f); } catch { /* ignore */ } });
}

describe('encrypt command', () => {
  const envContent = 'DB_PASS=secret\nAPI_KEY=key123\nNODE_ENV=production\n';
  const passphrase = 'test-pass';

  it('encrypts all values and writes to output file', async () => {
    const input = writeTempEnv(envContent);
    const output = input + '.out';
    const cli = createCli();
    await cli.parseAsync(['encrypt', input, '--passphrase', passphrase, '--output', output]);
    const result = fs.readFileSync(output, 'utf8');
    expect(result).toContain('enc:');
    cleanup(input, output);
  });

  it('encrypts only specified keys', async () => {
    const input = writeTempEnv(envContent);
    const output = input + '.out';
    const cli = createCli();
    await cli.parseAsync(['encrypt', input, '--passphrase', passphrase, '--keys', 'DB_PASS', '--output', output]);
    const result = fs.readFileSync(output, 'utf8');
    expect(result).toContain('enc:');
    expect(result).toContain('API_KEY=key123');
    cleanup(input, output);
  });

  it('decrypts an encrypted file', async () => {
    const input = writeTempEnv(envContent);
    const encrypted = input + '.enc';
    const decrypted = input + '.dec';
    const cli = createCli();
    await cli.parseAsync(['encrypt', input, '--passphrase', passphrase, '--output', encrypted]);
    await cli.parseAsync(['encrypt', encrypted, '--passphrase', passphrase, '--decrypt', '--output', decrypted]);
    const result = fs.readFileSync(decrypted, 'utf8');
    expect(result).toContain('DB_PASS=secret');
    expect(result).toContain('API_KEY=key123');
    cleanup(input, encrypted, decrypted);
  });

  it('exits with error for missing file', async () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    const cli = createCli();
    await expect(
      cli.parseAsync(['encrypt', '/nonexistent/.env', '--passphrase', passphrase])
    ).rejects.toThrow();
    mockExit.mockRestore();
  });
});
