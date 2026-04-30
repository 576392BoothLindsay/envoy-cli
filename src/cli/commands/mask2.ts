import type { Argv } from 'yargs';
import * as fs from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { maskEnv2, formatMask2Result, MaskStrategy } from '../../mask2/envMask2';

export function registerMask2Command(cli: Argv): void {
  cli.command(
    'mask2 <file>',
    'Mask env values with configurable strategy',
    (yargs) =>
      yargs
        .positional('file', { type: 'string', description: 'Path to .env file', demandOption: true })
        .option('keys', {
          alias: 'k',
          type: 'array',
          string: true,
          description: 'Keys to mask',
          demandOption: true,
        })
        .option('strategy', {
          alias: 's',
          type: 'string',
          choices: ['full', 'partial', 'length'] as MaskStrategy[],
          default: 'full',
          description: 'Masking strategy',
        })
        .option('char', {
          type: 'string',
          default: '*',
          description: 'Mask character',
        })
        .option('visible-start', { type: 'number', default: 2, description: 'Visible chars at start (partial)' })
        .option('visible-end', { type: 'number', default: 2, description: 'Visible chars at end (partial)' })
        .option('output', { alias: 'o', type: 'string', description: 'Output file path' })
        .option('print', { type: 'boolean', default: false, description: 'Print result to stdout' }),
    (argv) => {
      const raw = fs.readFileSync(argv.file as string, 'utf-8');
      const env = parseEnv(raw);
      const result = maskEnv2(env, argv.keys as string[], {
        strategy: argv.strategy as MaskStrategy,
        char: argv.char as string,
        visibleStart: argv['visible-start'] as number,
        visibleEnd: argv['visible-end'] as number,
      });

      if (argv.print) {
        console.log(formatMask2Result(result));
      }

      const outPath = (argv.output as string) || (argv.file as string);
      fs.writeFileSync(outPath, serializeEnv(result.masked));
      if (!argv.print) {
        console.log(formatMask2Result(result));
      }
    }
  );
}
