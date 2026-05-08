import type { Argv } from 'yargs';
import * as fs from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { maskEnv8, formatMask8Result } from '../../mask8/envMask8';

export function registerMask8Command(cli: Argv): void {
  cli.command(
    'mask8 <file>',
    'Mask specific keys in an env file with visible start/end characters',
    (yargs) =>
      yargs
        .positional('file', { type: 'string', demandOption: true, describe: 'Path to .env file' })
        .option('keys', {
          alias: 'k',
          type: 'array',
          string: true,
          demandOption: true,
          describe: 'Keys to mask',
        })
        .option('char', {
          type: 'string',
          default: '*',
          describe: 'Mask character',
        })
        .option('visible-start', {
          type: 'number',
          default: 2,
          describe: 'Number of visible characters at start',
        })
        .option('visible-end', {
          type: 'number',
          default: 2,
          describe: 'Number of visible characters at end',
        })
        .option('output', {
          alias: 'o',
          type: 'string',
          describe: 'Output file (defaults to stdout)',
        }),
    (argv) => {
      const raw = fs.readFileSync(argv.file as string, 'utf-8');
      const env = parseEnv(raw);
      const result = maskEnv8(env, argv.keys as string[], {
        char: argv.char as string,
        visibleStart: argv['visible-start'] as number,
        visibleEnd: argv['visible-end'] as number,
      });

      if (argv.output) {
        fs.writeFileSync(argv.output as string, serializeEnv(result.masked));
      } else {
        console.log(formatMask8Result(result));
      }
    }
  );
}
