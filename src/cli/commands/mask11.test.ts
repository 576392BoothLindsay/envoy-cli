import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { registerMask11Command } from './mask11';
import yargs from 'yargs';

const tmpDir = os.tmpdir();

function writeTempEnv(content: string): string {
  const file = path.join(tmpDir, `mask11-test-${Date.now()}.env`);
  fs.writeFileSync(file, content);
  return file;
}

function cleanup(file: string): void {
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

describe('registerMask11Command', () => {
  it('registers the mask11 command without error', () => {
    const cli = yargs();
    expect(() => registerMask11Command(cli)).not.toThrow();
  });

  it('masks keys and prints result', () => {
    const file = writeTempEnv('API_KEY=supersecret\nDB_HOST=localhost\n');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});

    try {
      const cli = yargs().command(
        '$0 <file>',
        '',
        (y) => y.positional('file', { type: 'string' }),
        () => {}
      );
      registerMask11Command(cli);
      cli.parse(`mask11 ${file} --keys API_KEY`);
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('Masked'));
    } finally {
      spy.mockRestore();
      cleanup(file);
    }
  });

  it('writes output to file when --output is specified', () => {
    const file = writeTempEnv('TOKEN=abcdefgh\n');
    const outFile = path.join(tmpDir, `mask11-out-${Date.now()}.env`);

    try {
      const cli = yargs();
      registerMask11Command(cli);
      cli.parse(`mask11 ${file} --keys TOKEN --output ${outFile}`);
      expect(fs.existsSync(outFile)).toBe(true);
      const content = fs.readFileSync(outFile, 'utf-8');
      expect(content).toContain('TOKEN');
    } finally {
      cleanup(file);
      cleanup(outFile);
    }
  });
});
