import type { Argv } from 'yargs';
import { readFileSync, writeFileSync } from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { buildOmitResult, formatOmitResult, omitByPattern } from '../../omit/envOmit';

export function registerOmitCommand(yargs: Argv): Argv {
  return yargs.command(
    'omit <file>',
    'Remove specified keys from an .env file',
    (y) =>
      y
        .positional('file', { type: 'string', demandOption: true, describe: '.env file path' })
        .option('keys', { type: 'array', string: true, describe: 'Keys to omit' })
        .option('pattern', { type: 'string', describe: 'Regex pattern to match keys for omission' })
        .option('output', { type: 'string', alias: 'o', describe: 'Output file (defaults to stdout)' })
        .option('quiet', { type: 'boolean', default: false }),
    (argv) => {
      const content = readFileSync(argv.file as string, 'utf-8');
      let env = parseEnv(content);

      if (argv.pattern) {
        env = omitByPattern(env, new RegExp(argv.pattern));
      }

      const keys = (argv.keys as string[]) ?? [];
      const omitResult = buildOmitResult(env, keys);

      const serialized = serializeEnv(omitResult.result);

      if (argv.output) {
        writeFileSync(argv.output as string, serialized);
      } else {
        process.stdout.write(serialized + '\n');
      }

      if (!argv.quiet) {
        console.error(formatOmitResult(omitResult));
      }
    }
  );
}
