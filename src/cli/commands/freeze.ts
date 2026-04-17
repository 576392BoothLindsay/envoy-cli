import type { Argv } from 'yargs';
import { readFileSync, writeFileSync } from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { freezeKeys, applyFreeze, formatFreezeResult } from '../../freeze/envFreeze';

export function registerFreezeCommand(yargs: Argv): Argv {
  return yargs.command(
    'freeze <file>',
    'Freeze specific keys so they are not overwritten during sync/merge',
    (y) =>
      y
        .positional('file', { type: 'string', demandOption: true, describe: '.env file path' })
        .option('keys', { type: 'array', string: true, demandOption: true, describe: 'Keys to freeze' })
        .option('target', { type: 'string', describe: 'Target file to apply freeze against' })
        .option('output', { type: 'string', describe: 'Output file (defaults to stdout)' }),
    (argv) => {
      const baseContent = readFileSync(argv.file as string, 'utf-8');
      const base = parseEnv(baseContent);
      const keys = argv.keys as string[];

      const result = freezeKeys(base, keys);

      if (argv.target) {
        const targetContent = readFileSync(argv.target as string, 'utf-8');
        const incoming = parseEnv(targetContent);
        const merged = applyFreeze(base, incoming, result.frozenKeys);
        const serialized = serializeEnv(merged);
        if (argv.output) {
          writeFileSync(argv.output as string, serialized);
          console.log(`Freeze applied and written to ${argv.output}`);
        } else {
          process.stdout.write(serialized);
        }
      } else {
        console.log(formatFreezeResult(result));
      }
    }
  );
}
