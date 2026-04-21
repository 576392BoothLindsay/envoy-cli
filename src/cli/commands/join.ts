import type { Argv } from 'yargs';
import { readFileSync, writeFileSync } from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { joinEnv, formatJoinResult } from '../../join/envJoiner';

export function registerJoinCommand(yargs: Argv): Argv {
  return yargs.command(
    'join <file>',
    'Join env keys with numeric suffixes into single concatenated values',
    (y) =>
      y
        .positional('file', { type: 'string', description: '.env file path', demandOption: true })
        .option('separator', {
          alias: 's',
          type: 'string',
          default: ',',
          description: 'Separator between joined values',
        })
        .option('prefix', {
          alias: 'p',
          type: 'string',
          description: 'Only join keys with this prefix',
        })
        .option('output', {
          alias: 'o',
          type: 'string',
          description: 'Write result to file instead of stdout',
        })
        .option('json', {
          type: 'boolean',
          default: false,
          description: 'Output as JSON',
        }),
    (argv) => {
      const raw = readFileSync(argv.file as string, 'utf-8');
      const env = parseEnv(raw);
      const result = joinEnv(env, {
        separator: argv.separator as string,
        prefix: argv.prefix as string | undefined,
      });

      if (argv.json) {
        console.log(JSON.stringify(result.joined, null, 2));
      } else if (argv.output) {
        const merged = { ...env, ...result.joined };
        writeFileSync(argv.output as string, serializeEnv(merged));
        console.log(`Written to ${argv.output}`);
      } else {
        console.log(formatJoinResult(result));
      }
    }
  );
}
