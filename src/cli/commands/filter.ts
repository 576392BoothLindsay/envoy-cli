import type { Argv } from 'yargs';
import * as fs from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { filterEnv, filterByPrefix, formatFilterResult } from '../../filter/envFilter';

export function registerFilterCommand(yargs: Argv): Argv {
  return yargs.command(
    'filter <input>',
    'Filter .env file keys by name, pattern, or prefix',
    (y) =>
      y
        .positional('input', { type: 'string', description: 'Path to .env file', demandOption: true })
        .option('keys', { type: 'array', string: true, description: 'Specific keys to include/exclude' })
        .option('pattern', { type: 'string', description: 'Substring or regex pattern to match keys' })
        .option('prefix', { type: 'string', description: 'Filter keys by prefix' })
        .option('strip-prefix', { type: 'boolean', default: false, description: 'Strip prefix from result keys' })
        .option('mode', {
          choices: ['include', 'exclude'] as const,
          default: 'include' as const,
          description: 'Whether to include or exclude matched keys',
        })
        .option('output', { type: 'string', description: 'Write result to file instead of stdout' })
        .option('summary', { type: 'boolean', default: false, description: 'Print filter summary' }),
    (argv) => {
      const raw = fs.readFileSync(argv.input as string, 'utf-8');
      const env = parseEnv(raw);

      let filtered: Record<string, string>;

      if (argv.prefix) {
        filtered = filterByPrefix(env, argv.prefix, argv['strip-prefix'] as boolean);
      } else {
        const pattern = argv.pattern
          ? argv.pattern.startsWith('/') && argv.pattern.endsWith('/')
            ? new RegExp(argv.pattern.slice(1, -1))
            : argv.pattern
          : undefined;

        const result = filterEnv(env, {
          keys: (argv.keys as string[]) ?? [],
          pattern,
          mode: argv.mode as 'include' | 'exclude',
        });

        if (argv.summary) {
          console.log(formatFilterResult(result));
        }

        filtered = result.filtered;
      }

      const output = serializeEnv(filtered);

      if (argv.output) {
        fs.writeFileSync(argv.output as string, output, 'utf-8');
        console.log(`Filtered env written to ${argv.output}`);
      } else {
        console.log(output);
      }
    }
  );
}
