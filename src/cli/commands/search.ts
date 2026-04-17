import type { Argv } from 'yargs';
import { readFileSync } from 'fs';
import { parseEnv } from '../../parser/envParser';
import { searchEnv, formatSearchResult } from '../../search/envSearch';

export function registerSearchCommand(cli: Argv): void {
  cli.command(
    'search <query> [file]',
    'Search for keys or values in a .env file',
    (yargs) =>
      yargs
        .positional('query', { type: 'string', demandOption: true, describe: 'Search query' })
        .positional('file', { type: 'string', default: '.env', describe: 'Path to .env file' })
        .option('keys-only', { type: 'boolean', default: false, describe: 'Search keys only' })
        .option('values-only', { type: 'boolean', default: false, describe: 'Search values only' })
        .option('case-sensitive', { type: 'boolean', default: false, describe: 'Case-sensitive search' })
        .option('regex', { type: 'boolean', default: false, describe: 'Treat query as regex' })
        .option('json', { type: 'boolean', default: false, describe: 'Output as JSON' }),
    (argv) => {
      const raw = readFileSync(argv.file as string, 'utf-8');
      const env = parseEnv(raw);
      const results = searchEnv(env, argv.query as string, {
        caseSensitive: argv['case-sensitive'] as boolean,
        matchKeys: !(argv['values-only'] as boolean),
        matchValues: !(argv['keys-only'] as boolean),
        regex: argv.regex as boolean,
      });
      if (argv.json) {
        console.log(JSON.stringify(results, null, 2));
      } else {
        console.log(formatSearchResult(results, argv.query as string));
      }
    }
  );
}
