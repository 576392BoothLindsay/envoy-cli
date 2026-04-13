import { createCli } from './index';

describe('CLI - compare command', () => {
  it('registers compare command', () => {
    const program = createCli();
    const commands = program.commands.map((c) => c.name());
    expect(commands).toContain('compare');
  });

  it('compare command has correct description', () => {
    const program = createCli();
    const compareCmd = program.commands.find((c) => c.name() === 'compare');
    expect(compareCmd).toBeDefined();
    expect(compareCmd?.description()).toContain('Compare');
  });

  it('compare command accepts --redact option', () => {
    const program = createCli();
    const compareCmd = program.commands.find((c) => c.name() === 'compare');
    const options = compareCmd?.options.map((o) => o.long);
    expect(options).toContain('--redact');
  });

  it('compare command accepts --json option', () => {
    const program = createCli();
    const compareCmd = program.commands.find((c) => c.name() === 'compare');
    const options = compareCmd?.options.map((o) => o.long);
    expect(options).toContain('--json');
  });

  it('compare command accepts --fail-on-conflict option', () => {
    const program = createCli();
    const compareCmd = program.commands.find((c) => c.name() === 'compare');
    const options = compareCmd?.options.map((o) => o.long);
    expect(options).toContain('--fail-on-conflict');
  });
});
