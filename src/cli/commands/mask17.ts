import type { Argv } from 'yargs';
import { readFileSync, writeFileSync } from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { maskEnv17, formatMask17Result } from '../../mask17/envMask17';

export function registerMask17Command(yargs: Argv): Argv {
  return yargs.command(
    'mask17 <file>',
    'Mask specific keys in an env file (show partial start/end)',
    (y) =>
      y
        .positional('file', { type: 'string', demandOption: true, describe: 'Path to .env file' })
        .option('keys', { type: 'array', string: true, demandOption: true, describe: 'Keys to mask' })
        .option('char', { type: 'string', default: '*', describe: 'Mask character' })
        .option('visible-start', { type: 'number', default: 2, describe: 'Visible chars at start' })
        .option('visible-end', { type: 'number', default: 2, describe: 'Visible chars at end' })
        .option('min-length', { type: 'number', default: 6, describe: 'Minimum length before partial masking' })
        .option('output', { type: 'string', describe: 'Output file (defaults to stdout)' })
        .option('write', { type: 'boolean', default: false, describe: 'Overwrite input file' }),
    (argv) => {
      const raw = readFileSync(argv.file as string, 'utf-8');
      const env = parseEnv(raw);
      const result = maskEnv17(env, argv.keys as string[], {
        char: argv.char as string,
        visibleStart: argv['visible-start'] as number,
        visibleEnd: argv['visible-end'] as number,
        minLength: argv['min-length'] as number,
      });

      console.log(formatMask17Result(result));

      if (argv.write) {
        writeFileSync(argv.file as string, serializeEnv(result.masked));
      } else if (argv.output) {
        writeFileSync(argv.output as string, serializeEnv(result.masked));
      }
    }
  );
}
