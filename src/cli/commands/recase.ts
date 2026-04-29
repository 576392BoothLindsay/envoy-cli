import type { Argv } from 'yargs';
import { readFileSync, writeFileSync } from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { recaseEnv, type CaseStrategy } from '../../recase/envRecaser';

export function registerRecaseCommand(yargs: Argv): Argv {
  return yargs.command(
    'recase <file>',
    'Recase all keys in a .env file to a target naming convention',
    (y) =>
      y
        .positional('file', {
          type: 'string',
          description: 'Path to the .env file',
          demandOption: true,
        })
        .option('strategy', {
          alias: 's',
          type: 'string',
          choices: ['camel', 'snake', 'pascal', 'kebab', 'constant'] as const,
          default: 'constant',
          description: 'Target key casing strategy',
        })
        .option('output', {
          alias: 'o',
          type: 'string',
          description: 'Output file path (defaults to overwriting input)',
        })
        .option('dry-run', {
          type: 'boolean',
          default: false,
          description: 'Preview changes without writing',
        }),
    (argv) => {
      const raw = readFileSync(argv.file as string, 'utf-8');
      const env = parseEnv(raw);
      const result = recaseEnv(env, argv.strategy as CaseStrategy);

      if (argv['dry-run']) {
        console.log(`Would recase ${result.changed.length} key(s):`);
        for (const key of result.changed) {
          console.log(`  ${key}`);
        }
        return;
      }

      const serialized = serializeEnv(result.recased);
      const outPath = (argv.output as string) ?? (argv.file as string);
      writeFileSync(outPath, serialized, 'utf-8');
      console.log(
        `Recased ${result.changed.length} key(s) using "${argv.strategy}" strategy → ${outPath}`
      );
    }
  );
}
