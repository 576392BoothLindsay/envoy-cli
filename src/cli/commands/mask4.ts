import type { Argv } from 'yargs';
import { readFileSync, writeFileSync } from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { maskEnv4, formatMask4Result } from '../../mask4/envMask4';

export function registerMask4Command(cli: Argv): void {
  cli.command(
    'mask4 <file>',
    'Mask env values with visible prefix/suffix',
    (yargs) =>
      yargs
        .positional('file', { type: 'string', demandOption: true, describe: '.env file path' })
        .option('keys', { type: 'array', string: true, default: [], describe: 'Keys to mask' })
        .option('char', { type: 'string', default: '*', describe: 'Mask character' })
        .option('visible-start', { type: 'number', default: 2, describe: 'Visible chars at start' })
        .option('visible-end', { type: 'number', default: 2, describe: 'Visible chars at end' })
        .option('output', { type: 'string', describe: 'Write output to file' })
        .option('quiet', { type: 'boolean', default: false, describe: 'Suppress output' }),
    (argv) => {
      const content = readFileSync(argv.file as string, 'utf-8');
      const env = parseEnv(content);
      const keys = argv.keys as string[];

      const result = maskEnv4(env, keys, {
        char: argv.char as string,
        visibleStart: argv['visible-start'] as number,
        visibleEnd: argv['visible-end'] as number,
      });

      if (argv.output) {
        writeFileSync(argv.output as string, serializeEnv(result.masked));
      }

      if (!argv.quiet) {
        console.log(formatMask4Result(result));
      }
    }
  );
}
