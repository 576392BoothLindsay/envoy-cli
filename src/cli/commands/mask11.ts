import type { Argv } from 'yargs';
import * as fs from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { maskEnv11, formatMask11Result } from '../../mask11/envMask11';

export function registerMask11Command(cli: Argv): void {
  cli.command(
    'mask11 <file>',
    'Mask specific keys in an env file with visible prefix/suffix',
    (yargs) =>
      yargs
        .positional('file', { type: 'string', demandOption: true, describe: 'Path to .env file' })
        .option('keys', {
          alias: 'k',
          type: 'array',
          string: true,
          default: [] as string[],
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
          describe: 'Write masked env to file instead of stdout',
        }),
    (argv) => {
      const content = fs.readFileSync(argv.file as string, 'utf-8');
      const env = parseEnv(content);
      const result = maskEnv11(env, argv.keys as string[], {
        char: argv.char as string,
        visibleStart: argv['visible-start'] as number,
        visibleEnd: argv['visible-end'] as number,
      });

      if (argv.output) {
        fs.writeFileSync(argv.output as string, serializeEnv(result.masked));
      } else {
        console.log(formatMask11Result(result));
      }
    }
  );
}
