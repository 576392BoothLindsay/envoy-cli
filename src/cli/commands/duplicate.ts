import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { duplicateEnv, formatDuplicateResult } from '../../duplicate/envDuplicate';

export function registerDuplicateCommand(program: Command): void {
  program
    .command('duplicate <files...>')
    .description('Find and remove duplicate keys across one or more .env files')
    .option('-o, --output <file>', 'Write cleaned output to file')
    .option('--dry-run', 'Show duplicates without modifying files')
    .action((files: string[], options: { output?: string; dryRun?: boolean }) => {
      const envs = files.map((f) => {
        const content = readFileSync(f, 'utf-8');
        return parseEnv(content);
      });

      const result = duplicateEnv(envs);
      console.log(formatDuplicateResult(result));

      if (!options.dryRun) {
        const serialized = serializeEnv(result.cleaned);
        if (options.output) {
          writeFileSync(options.output, serialized, 'utf-8');
          console.log(`\nCleaned env written to ${options.output}`);
        } else {
          console.log('\nCleaned output:');
          console.log(serialized);
        }
      }
    });
}
