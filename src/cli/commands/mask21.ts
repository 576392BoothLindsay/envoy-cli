import type { Argv } from 'yargs';
import { readFileSync } from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { maskEnv21, formatMask21Result } from '../../mask21/envMask21';

export function registerMask21Command(yargs: Argv): Argv {
  return yargs.command(
    'mask21 <file>',
    'Mask specific keys in a .env file with configurable visible ends',
    (y) =>
      y
        .positional('file', { type: 'string', demandOption: true, describe: 'Path to .env file' })
        .option('keys', { type: 'array', string: true, default: [], describe: 'Keys to mask' })
        .option('char', { type: 'string', default: '*', describe: 'Mask character' })
        .option('visible-start', { type: 'number', default: 2, describe: 'Visible chars at start' })
        .option('visible-end', { type: 'number', default: 2, describe: 'Visible chars at end' })
        .option('min-length', { type: 'number', default: 6, describe: 'Min length before partial masking' })
        .option('output', { type: 'boolean', default: false, describe: 'Output masked env to stdout' }),
    (argv) => {
      const raw = readFileSync(argv.file as string, 'utf-8');
      const env = parseEnv(raw);
      const result = maskEnv21(env, argv.keys as string[], {
        char: argv.char as string,
        visibleStart: argv['visible-start'] as number,
        visibleEnd: argv['visible-end'] as number,
        minLength: argv['min-length'] as number,
      });

      if (argv.output) {
        process.stdout.write(serializeEnv(result.masked) + '\n');
      } else {
        console.log(formatMask21Result(result));
      }
    }
  );
}
