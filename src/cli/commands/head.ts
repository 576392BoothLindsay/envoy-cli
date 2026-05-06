import { Command } from 'commander';
import * as fs from 'fs';
import { parseEnv } from '../../parser/envParser';
import { headEnv, headByPrefix, formatHeadResult } from '../../head/envHead';

export function registerHeadCommand(program: Command): void {
  program
    .command('head <file>')
    .description('Show the first N entries of an env file')
    .option('-n, --lines <number>', 'Number of entries to show', '10')
    .option('--by-prefix', 'Show first N entries per prefix group')
    .option('--json', 'Output as JSON')
    .action((file: string, options: { lines: string; byPrefix?: boolean; json?: boolean }) => {
      if (!fs.existsSync(file)) {
        console.error(`File not found: ${file}`);
        process.exit(1);
      }

      const raw = fs.readFileSync(file, 'utf-8');
      const env = parseEnv(raw);
      const n = parseInt(options.lines, 10);

      if (isNaN(n) || n < 0) {
        console.error('--lines must be a non-negative integer');
        process.exit(1);
      }

      if (options.byPrefix) {
        const grouped = headByPrefix(env, n);
        if (options.json) {
          console.log(JSON.stringify(grouped, null, 2));
        } else {
          for (const [prefix, entries] of Object.entries(grouped)) {
            console.log(`\n# ${prefix}`);
            for (const [key, value] of Object.entries(entries)) {
              console.log(`${key}=${value}`);
            }
          }
        }
        return;
      }

      const result = headEnv(env, n);

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(formatHeadResult(result));
      }
    });
}
