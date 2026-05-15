import type { Argv } from 'yargs';
import { readFileSync } from 'fs';
import { parseEnv } from '../../parser/envParser';
import { containsValue, containsKey, formatContainsResult } from '../../contains/envContains';

export function registerContainsCommand(cli: Argv): void {
  cli.command(
    'contains <file> <substring>',
    'Find env entries whose keys or values contain a substring',
    (yargs) =>
      yargs
        .positional('file', { type: 'string', demandOption: true, describe: '.env file path' })
        .positional('substring', { type: 'string', demandOption: true, describe: 'Substring to search for' })
        .option('keys', {
          type: 'boolean',
          default: false,
          describe: 'Search in keys instead of values',
        })
        .option('ignore-case', {
          alias: 'i',
          type: 'boolean',
          default: false,
          describe: 'Case-insensitive matching',
        }),
    (argv) => {
      const raw = readFileSync(argv.file as string, 'utf-8');
      const env = parseEnv(raw);
      const caseSensitive = !argv['ignore-case'];
      const substring = argv.substring as string;

      const result = argv.keys
        ? containsKey(env, substring, caseSensitive)
        : containsValue(env, substring, caseSensitive);

      console.log(formatContainsResult(result));

      if (result.matchCount === 0) {
        process.exit(1);
      }
    }
  );
}
