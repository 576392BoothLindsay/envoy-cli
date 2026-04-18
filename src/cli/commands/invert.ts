import type { Argv } from 'yargs';
import { readFileSync, writeFileSync } from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { invertEnv, formatInvertResult } from '../../invert/envInverter';

export function registerInvertCommand(yargs: Argv): Argv {
  return yargs.command(
    'invert <file>',
    'Invert an .env file so values become keys and keys become values',
    (y) =>
      y
        .positional('file', { type: 'string', demandOption: true, describe: 'Input .env file' })
        .option('output', {
          alias: 'o',
          type: 'string',
          describe: 'Write result to file instead of stdout',
        })
        .option('quiet', {
          alias: 'q',
          type: 'boolean',
          default: false,
          describe: 'Suppress summary output',
        }),
    (argv) => {
      const raw = readFileSync(argv.file as string, 'utf-8');
      const env = parseEnv(raw);
      const result = invertEnv(env);

      const serialized = serializeEnv(result.inverted);

      if (argv.output) {
        writeFileSync(argv.output as string, serialized, 'utf-8');
        if (!argv.quiet) console.log(formatInvertResult(result));
      } else {
        console.log(serialized);
        if (!argv.quiet) console.error(formatInvertResult(result));
      }
    }
  );
}
