import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { createCli } from '../index';

function writeTempEnv(content: string): string {
  const file = path.join(os.tmpdir(), `envoy-prefix-${Date.now()}.env`);
  fs.writeFileSync(file, content);
  return file;
}

function cleanup(...files: string[]) {
  files.forEach((f) => { try { fs.unlinkSync(f); } catch {} });
}

describe('prefix command', () => {
  it('adds prefix to keys', async () => {
    const file = writeTempEnv('FOO=bar\nBAZ=qux\n');
    const logs: string[] = [];
    jest.spyOn(console, 'log').mockImplementation((msg) => logs.push(msg));
    await createCli().parseAsync(['prefix', file, '--add', 'APP_']);
    expect(logs.join('\n')).toContain('APP_FOO');
    cleanup(file);
    jest.restoreAllMocks();
  });

  it('removes prefix from keys', async () => {
    const file = writeTempEnv('APP_FOO=bar\nAPP_BAZ=qux\n');
    const logs: string[] = [];
    jest.spyOn(console, 'log').mockImplementation((msg) => logs.push(msg));
    await createCli().parseAsync(['prefix', file, '--remove', 'APP_']);
    expect(logs.join('\n')).toContain('FOO=bar');
    cleanup(file);
    jest.restoreAllMocks();
  });

  it('lists keys with prefix', async () => {
    const file = writeTempEnv('APP_FOO=bar\nBAZ=qux\n');
    const logs: string[] = [];
    jest.spyOn(console, 'log').mockImplementation((msg) => logs.push(msg));
    await createCli().parseAsync(['prefix', file, '--list', 'APP_']);
    expect(logs.join('\n')).toContain('APP_FOO');
    expect(logs.join('\n')).not.toContain('BAZ');
    cleanup(file);
    jest.restoreAllMocks();
  });
});
