import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { createCli } from '../index';

const tmpFile = join(__dirname, '.test-mask16.env');

function writeTempEnv(content: string): void {
  writeFileSync(tmpFile, content, 'utf-8');
}

function cleanup(): void {
  try { unlinkSync(tmpFile); } catch {}
}

afterEach(cleanup);

describe('mask16 command', () => {
  it('prints masked output summary', async () => {
    writeTempEnv('API_KEY=supersecret\nHOST=localhost\n');
    const logs: string[] = [];
    const spy = jest.spyOn(console, 'log').mockImplementation((msg) => logs.push(msg));
    const cli = createCli();
    await cli.parseAsync(['mask16', tmpFile, 'API_KEY']);
    spy.mockRestore();
    expect(logs.join('\n')).toContain('Masked 1 key(s)');
    expect(logs.join('\n')).toContain('API_KEY');
  });

  it('prints serialized env with --output flag', async () => {
    writeTempEnv('SECRET=mysecretvalue\n');
    const logs: string[] = [];
    const spy = jest.spyOn(console, 'log').mockImplementation((msg) => logs.push(msg));
    const cli = createCli();
    await cli.parseAsync(['mask16', tmpFile, 'SECRET', '--output']);
    spy.mockRestore();
    const output = logs.join('\n');
    expect(output).toContain('SECRET=');
    expect(output).not.toContain('mysecretvalue');
  });

  it('handles missing key gracefully', async () => {
    writeTempEnv('HOST=localhost\n');
    const logs: string[] = [];
    const spy = jest.spyOn(console, 'log').mockImplementation((msg) => logs.push(msg));
    const cli = createCli();
    await cli.parseAsync(['mask16', tmpFile, 'MISSING']);
    spy.mockRestore();
    expect(logs.join('\n')).toContain('No keys masked.');
  });
});
