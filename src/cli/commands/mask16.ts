import type { Argv } from 'yargs';
import { readFileSync } from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { maskEnv16, formatMask16Result } from '../../mask16/envMask16';

export function registerMask16Command(cli: Argv): void {
  cli.command(
    'mask16 <file> <keys..>',
    'Mask specific keys in an env file with visible prefix/suffix',
    (yargs) =>
      yargs
        .positional('file', {
          type: 'string',
          description: 'Path to the .env file',
          demandOption: true,
        })
        .positional('keys', {
          type: 'string',
          description: 'Keys to mask',
          array: true,
          demandOption: true,
        })
        .option('char', {
          type: 'string',
          default: '*',
          description: 'Mask character',
        })
        .option('visible-start', {
          type: 'number',
          default: 2,
          description: 'Number of visible characters at the start',
        })
        .option('visible-end', {
          type: 'number',
          default: 2,
          description: 'Number of visible characters at the end',
        })
        .option('output', {
          type: 'boolean',
          default: false,
          description: 'Print masked env to stdout',
        }),
    (argv) => {
      const raw = readFileSync(argv.file as string, 'utf-8');
      const env = parseEnv(raw);
      const result = maskEnv16(env, argv.keys as string[], {
        char: argv.char as string,
        visibleStart: argv['visible-start'] as number,
        visibleEnd: argv['visible-end'] as number,
      });
      if (argv.output) {
        console.log(serializeEnv(result.masked));
      } else {
        console.log(formatMask16Result(result));
      }
    }
  );
}
