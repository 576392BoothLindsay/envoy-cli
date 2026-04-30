import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { createCli } from '../index';

const tmpDir = os.tmpdir();

function writeTempEnv(content: string): string {
  const file = path.join(tmpDir, `mask-test-${Date.now()}.env`);
  fs.writeFileSync(file, content, 'utf-8');
  return file;
}

function cleanup(...files: string[]): void {
  files.forEach(f => { if (fs.existsSync(f)) fs.unlinkSync(f); });
}

describe('mask command', () => {
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('masks all values by default', async () => {
    const file = writeTempEnv('API_KEY=abc123\nAPP_NAME=myapp\n');
    try {
      const cli = createCli();
      await cli.parseAsync(['node', 'envoy', 'mask', file]);
      const output = logSpy.mock.calls.map((c: string[]) => c[0]).join('\n');
      expect(output).toContain('API_KEY=');
      expect(output).not.toContain('abc123');
    } finally {
      cleanup(file);
    }
  });

  it('masks only specified keys', async () => {
    const file = writeTempEnv('SECRET=hidden\nNAME=visible\n');
    try {
      const cli = createCli();
      await cli.parseAsync(['node', 'envoy', 'mask', file, '--keys', 'SECRET']);
      const output = logSpy.mock.calls.map((c: string[]) => c[0]).join('\n');
      expect(output).toContain('NAME=visible');
      expect(output).not.toContain('hidden');
    } finally {
      cleanup(file);
    }
  });

  it('prints summary with --summary flag', async () => {
    const file = writeTempEnv('X=123\n');
    try {
      const cli = createCli();
      await cli.parseAsync(['node', 'envoy', 'mask', file, '--summary']);
      const output = logSpy.mock.calls.map((c: string[]) => c[0]).join('\n');
      expect(output).toContain('Masked');
    } finally {
      cleanup(file);
    }
  });

  it('errors on missing file', async () => {
    const cli = createCli();
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(cli.parseAsync(['node', 'envoy', 'mask', 'nonexistent.env'])).rejects.toThrow();
    exitSpy.mockRestore();
  });
});
