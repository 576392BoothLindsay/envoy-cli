import type { Argv } from 'yargs';
import { readFileSync } from 'fs';
import { parseEnv } from '../../parser/envParser';
import { maskEnv9, formatMask9Result } from '../../mask9/envMask9';

export function registerMask9Command(cli: Argv): void {
  cli.command(
    'mask9 <file>',
    'Mask specific keys in a .env file with configurable visibility',
    (yargs) =>
      yargs
        .positional('file', {
          describe: 'Path to .env file',
          type: 'string',
          demandOption: true,
        })
        .option('keys', {
          alias: 'k',
          type: 'array',
          string: true,
          describe: 'Keys to mask',
          default: [] as string[],
        })
        .option('char', {
          type: 'string',
          describe: 'Masking character',
          default: '*',
        })
        .option('visible-start', {
          type: 'number',
          describe: 'Number of visible characters at start',
          default: 2,
        })
        .option('visible-end', {
          type: 'number',
          describe: 'Number of visible characters at end',
          default: 2,
        })
        .option('min-length', {
          type: 'number',
          describe: 'Minimum value length before partial masking',
          default: 4,
        }),
    (argv) => {
      const content = readFileSync(argv.file as string, 'utf-8');
      const env = parseEnv(content);
      const keys = (argv.keys as string[]) ?? [];
      const result = maskEnv9(env, keys, {
        char: argv.char as string,
        visibleStart: argv['visible-start'] as number,
        visibleEnd: argv['visible-end'] as number,
        minLength: argv['min-length'] as number,
      });
      console.log(formatMask9Result(result));
    }
  );
}
