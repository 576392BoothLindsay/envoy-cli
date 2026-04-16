import type { Argv } from 'yargs';
import * as fs from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { addPrefix, removePrefix, listKeysWithPrefix } from '../../prefix/envPrefix';

export function registerPrefixCommand(yargs: Argv): Argv {
  return yargs.command(
    'prefix <file>',
    'Add or remove a prefix from env keys',
    (y) =>
      y
        .positional('file', { type: 'string', demandOption: true, describe: '.env file path' })
        .option('add', { type: 'string', describe: 'Prefix to add' })
        .option('remove', { type: 'string', describe: 'Prefix to remove' })
        .option('list', { type: 'string', describe: 'List keys with given prefix' })
        .option('output', { type: 'string', alias: 'o', describe: 'Output file (default: stdout)' }),
    (argv) => {
      const raw = fs.readFileSync(argv.file as string, 'utf-8');
      const env = parseEnv(raw);

      if (argv.list) {
        const keys = listKeysWithPrefix(env, argv.list as string);
        console.log(keys.join('\n'));
        return;
      }

      let result = env;
      if (argv.add) result = addPrefix(result, argv.add as string);
      if (argv.remove) result = removePrefix(result, argv.remove as string);

      const output = serializeEnv(result);
      if (argv.output) {
        fs.writeFileSync(argv.output as string, output);
        console.log(`Written to ${argv.output}`);
      } else {
        console.log(output);
      }
    }
  );
}
