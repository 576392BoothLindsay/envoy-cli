import { Command } from 'commander';
import { readFileSync } from 'fs';
import { parseEnv } from '../../parser/envParser';
import { tailEnv, tailByPrefix, formatTailResult } from '../../tail/envTail';

export function registerTailCommand(program: Command): void {
  program
    .command('tail <file>')
    .description('Show the last N entries of an env file')
    .option('-n, --count <number>', 'Number of entries to show', '10')
    .option('-p, --prefix <prefix>', 'Filter by prefix before tailing')
    .option('--json', 'Output as JSON')
    .action((file: string, options: { count: string; prefix?: string; json?: boolean }) => {
      const raw = readFileSync(file, 'utf-8');
      const env = parseEnv(raw);
      const count = parseInt(options.count, 10);

      const result = options.prefix
        ? tailByPrefix(env, options.prefix, count)
        : tailEnv(env, count);

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(formatTailResult(result));
      }
    });
}
