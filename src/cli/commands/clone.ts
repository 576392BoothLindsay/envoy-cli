import { Command } from 'commander';
import * as fs from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { cloneEnv, formatCloneResult } from '../../clone/envClone';

export function registerCloneCommand(program: Command): void {
  program
    .command('clone <source> <destination>')
    .description('Clone an env file with optional key transformations')
    .option('--prefix <prefix>', 'Add prefix to all cloned keys')
    .option('--strip-prefix <prefix>', 'Strip prefix from source keys before cloning')
    .option('--exclude <keys>', 'Comma-separated list of keys to exclude')
    .option('--override <pairs>', 'Comma-separated KEY=VALUE pairs to override after cloning')
    .option('--dry-run', 'Preview result without writing to destination')
    .action((source: string, destination: string, options) => {
      if (!fs.existsSync(source)) {
        console.error(`Error: Source file not found: ${source}`);
        process.exit(1);
      }

      const raw = fs.readFileSync(source, 'utf-8');
      const sourceEnv = parseEnv(raw);

      const exclude = options.exclude
        ? options.exclude.split(',').map((k: string) => k.trim())
        : [];

      const overrides: Record<string, string> = {};
      if (options.override) {
        for (const pair of options.override.split(',')) {
          const idx = pair.indexOf('=');
          if (idx !== -1) {
            overrides[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim();
          }
        }
      }

      const result = cloneEnv(sourceEnv, {
        prefix: options.prefix,
        stripPrefix: options.stripPrefix,
        exclude,
        overrides,
      });

      console.log(formatCloneResult(result));

      if (!options.dryRun) {
        const output = serializeEnv(result.cloned);
        fs.writeFileSync(destination, output, 'utf-8');
        console.log(`Written to ${destination}`);
      } else {
        console.log('\n--- Preview ---');
        console.log(serializeEnv(result.cloned));
      }
    });
}
