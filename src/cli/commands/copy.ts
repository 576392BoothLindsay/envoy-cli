import { Command } from 'commander';
import * as fs from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { copyKeys, copyAllKeys, formatCopyResult } from '../../copy/envCopy';

export function registerCopyCommand(program: Command): void {
  program
    .command('copy <source> <destination>')
    .description('Copy keys from one .env file to another')
    .option('-k, --keys <keys>', 'Comma-separated list of keys to copy (default: all)')
    .option('-o, --overwrite', 'Overwrite existing keys in destination', false)
    .option('--dry-run', 'Preview changes without writing', false)
    .action((sourcePath: string, destinationPath: string, opts) => {
      if (!fs.existsSync(sourcePath)) {
        console.error(`Source file not found: ${sourcePath}`);
        process.exit(1);
      }

      const sourceContent = fs.readFileSync(sourcePath, 'utf-8');
      const sourceEnv = parseEnv(sourceContent);

      const destContent = fs.existsSync(destinationPath)
        ? fs.readFileSync(destinationPath, 'utf-8')
        : '';
      const destEnv = parseEnv(destContent);

      const result = opts.keys
        ? copyKeys(sourceEnv, destEnv, opts.keys.split(',').map((k: string) => k.trim()), {
            overwrite: opts.overwrite,
          })
        : copyAllKeys(sourceEnv, destEnv, { overwrite: opts.overwrite });

      console.log(formatCopyResult(result));

      if (!opts.dryRun) {
        fs.writeFileSync(destinationPath, serializeEnv(result.destination), 'utf-8');
        console.log(`Written to ${destinationPath}`);
      } else {
        console.log('[dry-run] No changes written.');
      }
    });
}
