import type { Argv } from 'yargs';
import { readFileSync } from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { maskEnv23, formatMask23Result } from '../../mask23/envMask23';

export function registerMask23Command(yargs: Argv): Argv {
  return yargs.command(
    'mask23 <file>',
    'Mask specific keys in a .env file with visible prefix/suffix',
    (y) =>
      y
        .positional('file', { type: 'string', demandOption: true, describe: 'Path to .env file' })
        .option('keys', { type: 'array', string: true, default: [], describe: 'Keys to mask' })
        .option('char', { type: 'string', default: '*', describe: 'Mask character' })
        .option('visible-start', { type: 'number', default: 2, describe: 'Visible chars at start' })
        .option('visible-end', { type: 'number', default: 2, describe: 'Visible chars at end' })
        .option('output', { type: 'string', describe: 'Output file (default: stdout)' }),
    (argv) => {
      const content = readFileSync(argv.file as string, 'utf-8');
      const env = parseEnv(content);
      const result = maskEnv23(env, argv.keys as string[], {
        char: argv.char as string,
        visibleStart: argv['visible-start'] as number,
        visibleEnd: argv['visible-end'] as number,
      });

      if (argv.output) {
        const { writeFileSync } = require('fs');
        writeFileSync(argv.output, serializeEnv(result.masked));
      } else {
        console.log(formatMask23Result(result));
      }
    }
  );
}
