import { createCli } from './index';
import { Command } from 'commander';

describe('createCli', () => {
  let program: Command;

  beforeEach(() => {
    program = createCli();
  });

  it('should create a Command instance', () => {
    expect(program).toBeInstanceOf(Command);
  });

  it('should be named envoy', () => {
    expect(program.name()).toBe('envoy');
  });

  it('should register diff command', () => {
    const names = program.commands.map((c) => c.name());
    expect(names).toContain('diff');
  });

  it('should register sync command', () => {
    const names = program.commands.map((c) => c.name());
    expect(names).toContain('sync');
  });

  it('should register validate command', () => {
    const names = program.commands.map((c) => c.name());
    expect(names).toContain('validate');
  });

  it('diff command should have --no-redact option', () => {
    const diffCmd = program.commands.find((c) => c.name() === 'diff')!;
    const optionNames = diffCmd.options.map((o) => o.long);
    expect(optionNames).toContain('--no-redact');
  });

  it('sync command should have --dry-run option', () => {
    const syncCmd = program.commands.find((c) => c.name() === 'sync')!;
    const optionNames = syncCmd.options.map((o) => o.long);
    expect(optionNames).toContain('--dry-run');
  });

  it('validate command should have --schema option', () => {
    const validateCmd = program.commands.find((c) => c.name() === 'validate')!;
    const optionNames = validateCmd.options.map((o) => o.long);
    expect(optionNames).toContain('--schema');
  });
});
