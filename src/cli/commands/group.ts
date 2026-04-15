import type { Argv } from 'yargs';
import fs from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { groupByPrefix, flattenGroups, formatGroupResult } from '../../group/envGroup';

export function registerGroupCommand(yargs: Argv): Argv {
  return yargs.command(
    'group <file>',
    'Group env keys by prefix',
    (y) =>
      y
        .positional('file', {
          describe: 'Path to the .env file',
          type: 'string',
          demandOption: true,
        })
        .option('delimiter', {
          alias: 'd',
          type: 'string',
          default: '_',
          describe: 'Delimiter used to split key prefix',
        })
        .option('flatten', {
          alias: 'f',
          type: 'boolean',
          default: false,
          describe: 'Flatten grouped result back to dotenv format',
        })
        .option('output', {
          alias: 'o',
          type: 'string',
          describe: 'Write output to file instead of stdout',
        })
        .option('hide-ungrouped', {
          type: 'boolean',
          default: false,
          describe: 'Hide ungrouped keys from output',
        }),
    (argv) => {
      const raw = fs.readFileSync(argv.file as string, 'utf-8');
      const env = parseEnv(raw);
      const result = groupByPrefix(env, argv.delimiter as string);

      let output: string;
      if (argv.flatten) {
        output = serializeEnv(flattenGroups(result, argv.delimiter as string));
      } else {
        output = formatGroupResult(result, {
          showUngrouped: !(argv['hide-ungrouped'] as boolean),
        });
      }

      if (argv.output) {
        fs.writeFileSync(argv.output as string, output, 'utf-8');
        console.log(`Group result written to ${argv.output}`);
      } else {
        console.log(output);
      }
    }
  );
}
