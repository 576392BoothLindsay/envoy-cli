import { Command } from 'commander';
import { writeFileSync, unlinkSync, readFileSync } from 'fs';
import { join } from 'path';
import { registerCastCommand } from './cast';

const tmpFile = join(__dirname, '__cast_test__.env');

function writeTempEnv(content: string) {
  writeFileSync(tmpFile, content, 'utf-8');
}

function cleanup() {
  try { unlinkSync(tmpFile); } catch {}
}

beforeEach(() => writeTempEnv('PORT=3000\nDEBUG=true\nTAGS=a,b,c\n'));
afterEach(cleanup);

describe('registerCastCommand', () => {
  it('registers the cast command', () => {
    const program = new Command();
    registerCastCommand(program);
    const cmd = program.commands.find(c => c.name() === 'cast');
    expect(cmd).toBeDefined();
  });

  it('exits with error when no rules provided', async () => {
    const program = new Command();
    registerCastCommand(program);
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    const mockErr = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(program.parseAsync(['node', 'test', 'cast', tmpFile], { from: 'user' })).rejects.toThrow();
    expect(mockErr).toHaveBeenCalled();
    mockExit.mockRestore();
    mockErr.mockRestore();
  });

  it('outputs json when --json flag is used', async () => {
    const program = new Command();
    registerCastCommand(program);
    const mockLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    await program.parseAsync(['node', 'test', 'cast', tmpFile, '--rule', 'PORT:number', '--json'], { from: 'user' });
    const output = JSON.parse(mockLog.mock.calls[0][0]);
    expect(output.PORT).toBe(3000);
    mockLog.mockRestore();
  });

  it('writes output file after successful cast', async () => {
    const outFile = join(__dirname, '__cast_out__.env');
    const program = new Command();
    registerCastCommand(program);
    const mockLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    await program.parseAsync(['node', 'test', 'cast', tmpFile, '--rule', 'PORT:number', '--output', outFile], { from: 'user' });
    const written = readFileSync(outFile, 'utf-8');
    expect(written).toContain('PORT=3000');
    unlinkSync(outFile);
    mockLog.mockRestore();
  });
});
