import type { Argv } from 'yargs';
import * as fs from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { swapMultiple, formatSwapResult } from '../../swap/envSwapper';

export function registerSwapCommand(yargs: Argv): Argv {
  return yargs.command(
    'swap <file>',
    'Swap values between two or more key pairs in a .env file',
    (y) =>
      y
        .positional('file', { type: 'string', demandOption: true, describe: '.env file path' })
        .option('pair', {
          type: 'array',
          string: true,
          describe: 'Key pairs to swap in KEY_A:KEY_B format',
          demandOption: true,
        })
        .option('output', { type: 'string', describe: 'Output file (defaults to input file)' })
        .option('dry-run', { type: 'boolean', default: false, describe: 'Preview without writing' }),
    (argv) => {
      const file = argv.file as string;
      const raw = fs.readFileSync(file, 'utf-8');
      const env = parseEnv(raw);

      const pairs = (argv.pair as string[]).map((p) => {
        const [a, b] = p.split(':');
        if (!a || !b) throw new Error(`Invalid pair format: "${p}". Use KEY_A:KEY_B`);
        return [a, b] as [string, string];
      });

      const result = swapMultiple(env, pairs);
      console.log(formatSwapResult(result));

      if (!argv['dry-run']) {
        const outFile = (argv.output as string) || file;
        fs.writeFileSync(outFile, serializeEnv(result.swapped));
        console.log(`Written to ${outFile}`);
      }
    }
  );
}
