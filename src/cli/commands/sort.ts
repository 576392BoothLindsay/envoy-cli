import type { Argv } from 'yargs';
import * as fs from 'fs';
import * as path from 'path';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { sortEnv, formatSortResult, SortOrder } from '../../sort/envSorter';

export function registerSortCommand(yargs: Argv): Argv {
  return yargs.command(
    'sort <file>',
    'Sort keys in a .env file alphabetically',
    (y) =>
      y
        .positional('file', {
          describe: 'Path to the .env file',
          type: 'string',
          demandOption: true,
        })
        .option('order', {
          alias: 'o',
          describe: 'Sort order: asc or desc',
          choices: ['asc', 'desc'] as const,
          default: 'asc',
        })
        .option('group-by-prefix', {
          alias: 'g',
          describe: 'Group keys by their prefix before sorting',
          type: 'boolean',
          default: false,
        })
        .option('write', {
          alias: 'w',
          describe: 'Write sorted output back to the file',
          type: 'boolean',
          default: false,
        })
        .option('prefix-delimiter', {
          describe: 'Delimiter used to detect key prefixes',
          type: 'string',
          default: '_',
        }),
    (argv) => {
      const filePath = path.resolve(argv.file as string);

      if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
      }

      const raw = fs.readFileSync(filePath, 'utf-8');
      const env = parseEnv(raw);

      const result = sortEnv(env, {
        order: argv.order as SortOrder,
        groupByPrefix: argv['group-by-prefix'] as boolean,
        prefixDelimiter: argv['prefix-delimiter'] as string,
      });

      if (argv.write) {
        fs.writeFileSync(filePath, serializeEnv(result.sorted), 'utf-8');
        console.log(`Sorted ${result.keyCount} key(s) written to ${filePath}`);
      } else {
        console.log(formatSortResult(result));
      }
    }
  );
}
