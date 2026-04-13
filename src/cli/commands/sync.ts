import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { syncEnv } from '../../sync/envSync';

export function registerSyncCommand(program: Command): void {
  program
    .command('sync <source> <destination>')
    .description('Sync keys from source .env into destination .env')
    .option('--dry-run', 'Preview changes without writing to disk')
    .option('--overwrite', 'Overwrite existing keys in destination', false)
    .action((source: string, destination: string, options: { dryRun: boolean; overwrite: boolean }) => {
      const sourcePath = path.resolve(process.cwd(), source);
      const destPath = path.resolve(process.cwd(), destination);

      if (!fs.existsSync(sourcePath)) {
        console.error(`Error: Source file not found: ${sourcePath}`);
        process.exit(1);
      }

      const sourceEnv = parseEnv(fs.readFileSync(sourcePath, 'utf-8'));
      const destEnv = fs.existsSync(destPath)
        ? parseEnv(fs.readFileSync(destPath, 'utf-8'))
        : {};

      const synced = syncEnv(sourceEnv, destEnv, { overwrite: options.overwrite });
      const output = serializeEnv(synced);

      if (options.dryRun) {
        console.log('--- Dry run preview ---');
        console.log(output);
      } else {
        fs.writeFileSync(destPath, output, 'utf-8');
        console.log(`Synced ${sourcePath} → ${destPath}`);
      }
    });
}
