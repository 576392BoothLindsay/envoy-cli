import type { Argv } from 'yargs';
import { readFileSync, writeFileSync } from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { flattenEnv, formatFlattenResult } from '../../flatten/envFlattener';

export function registerFlattenCommand(yargs: Argv): Argv {
  return yargs.command(
    'flatten <file>',
    'Flatten nested JSON values in a .env file into separate keys',
    (y) =>
      y
        .positional('file', { type: 'string', demandOption: true, describe: '.env file to flatten' })
        .option('separator', { type: 'string', default: '__', describe: 'Key separator for nested keys' })
        .option('prefix', { type: 'string', default: '', describe: 'Prefix to add to all keys' })
        .option('output', { type: 'string', alias: 'o', describe: 'Output file (default: overwrite input)' })
        .option('json', { type: 'boolean', default: false, describe: 'Output as JSON' }),
    (argv) => {
      const raw = readFileSync(argv.file as string, 'utf-8');
      const env = parseEnv(raw);
      const result = flattenEnv(env, {
        separator: argv.separator as string,
        prefix: argv.prefix as string,
      });

      if (argv.json) {
        console.log(JSON.stringify(result.flattened, null, 2));
        return;
      }

      const outPath = (argv.output as string) || (argv.file as string);
      writeFileSync(outPath, serializeEnv(result.flattened), 'utf-8');
      console.log(formatFlattenResult(result));
    }
  );
}
