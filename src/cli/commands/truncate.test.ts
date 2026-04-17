import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { createCli } from '../index';

function writeTempEnv(content: string): string {
  const file = path.join(os.tmpdir(), `truncate-test-${Date.now()}.env`);
  fs.writeFileSync(file, content);
  return file;
}

function cleanup(...files: string[]): void {
  for (const f of files) if (fs.existsSync(f)) fs.unlinkSync(f);
}

describe('truncate command', () => {
  it('outputs truncated env to stdout', async () => {
    const file = writeTempEnv('LONG=abcdefghijklmnopqrstuvwxyz\nSHORT=hi\n');
    const logs: string[] = [];
    const cli = createCli();
    jest.spyOn(console, 'log').mockImplementation((msg) => logs.push(msg));
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await cli.parseAsync(['node', 'envoy', 'truncate', file, '--max-length', '10']);
    expect(logs.join('\n')).toContain('LONG=');
    jest.restoreAllMocks();
    cleanup(file);
  });

  it('writes output to file when --output is given', async () => {
    const file = writeTempEnv('KEY=abcdefghijklmnopqrstuvwxyz\n');
    const out = path.join(os.tmpdir(), `truncate-out-${Date.now()}.env`);
    const cli = createCli();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await cli.parseAsync(['node', 'envoy', 'truncate', file, '--max-length', '5', '--output', out]);
    const content = fs.readFileSync(out, 'utf-8');
    expect(content).toContain('KEY=');
    const val = content.match(/KEY=(.+)/)?.[1] ?? '';
    expect(val.length).toBeLessThanOrEqual(5);
    jest.restoreAllMocks();
    cleanup(file, out);
  });
});
