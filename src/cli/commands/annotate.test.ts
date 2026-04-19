import fs from 'fs';
import path from 'path';
import os from 'os';
import { createCli } from '../index';

const tmpDir = os.tmpdir();

function writeTempEnv(content: string): string {
  const file = path.join(tmpDir, `annotate-test-${Date.now()}.env`);
  fs.writeFileSync(file, content, 'utf-8');
  return file;
}

function cleanup(...files: string[]): void {
  for (const f of files) if (fs.existsSync(f)) fs.unlinkSync(f);
}

describe('annotate command', () => {
  it('prints annotated env to stdout', async () => {
    const file = writeTempEnv('API_KEY=secret\nPORT=3000\n');
    const logs: string[] = [];
    const spy = jest.spyOn(console, 'log').mockImplementation((msg) => logs.push(msg));

    const cli = createCli();
    await cli.parseAsync(['annotate', file, '--key', 'API_KEY=Your API key']);

    expect(logs.join('\n')).toContain('# Your API key');
    expect(logs.join('\n')).toContain('API_KEY=secret');

    spy.mockRestore();
    cleanup(file);
  });

  it('writes annotated env to output file', async () => {
    const file = writeTempEnv('DB_URL=postgres://localhost\n');
    const out = path.join(tmpDir, `annotate-out-${Date.now()}.env`);
    const logs: string[] = [];
    const spy = jest.spyOn(console, 'log').mockImplementation((msg) => logs.push(msg));

    const cli = createCli();
    await cli.parseAsync(['annotate', file, '--key', 'DB_URL=Database URL', '--output', out]);

    const content = fs.readFileSync(out, 'utf-8');
    expect(content).toContain('# Database URL');
    expect(logs.join('\n')).toContain('Annotated 1 key(s)');

    spy.mockRestore();
    cleanup(file, out);
  });
});
