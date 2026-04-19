import { Command } from 'commander';
import { registerDiffCommand } from './commands/diff';
import { registerSyncCommand } from './commands/sync';
import { registerValidateCommand } from './commands/validate';

const packageJson = require('../../package.json');

export function createCli(): Command {
  const program = new Command();

  program
    .name('envoy')
    .description('Manage, diff, and sync .env files across environments')
    .version(packageJson.version ?? '0.0.1');

  registerDiffCommand(program);
  registerSyncCommand(program);
  registerValidateCommand(program);

  return program;
}

export function run(argv: string[] = process.argv): void {
  const cli = createCli();

  try {
    cli.parse(argv);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Error: ${message}`);
    process.exit(1);
  }
}
