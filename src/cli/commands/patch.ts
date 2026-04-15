import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { applyPatch, parsePatchOperations, formatPatchResult } from '../../patch/envPatch';

export function registerPatchCommand(program: Command): void {
  program
    .command('patch <envFile> <patchFile>')
    .description('Apply a patch file to a .env file')
    .option('-o, --output <file>', 'Output file (defaults to overwriting input)')
    .option('--dry-run', 'Preview changes without writing', false)
    .action((envFile: string, patchFile: string, options: { output?: string; dryRun: boolean }) => {
      const envPath = path.resolve(envFile);
      const patchPath = path.resolve(patchFile);

      if (!fs.existsSync(envPath)) {
        console.error(`Error: env file not found: ${envPath}`);
        process.exit(1);
      }
      if (!fs.existsSync(patchPath)) {
        console.error(`Error: patch file not found: ${patchPath}`);
        process.exit(1);
      }

      const envContent = fs.readFileSync(envPath, 'utf-8');
      const patchContent = fs.readFileSync(patchPath, 'utf-8');

      let operations;
      try {
        operations = parsePatchOperations(patchContent);
      } catch (err) {
        console.error(`Error parsing patch file: ${(err as Error).message}`);
        process.exit(1);
      }

      const env = parseEnv(envContent);
      const result = applyPatch(env, operations);

      console.log(formatPatchResult(result));

      if (!options.dryRun) {
        const outputPath = options.output ? path.resolve(options.output) : envPath;
        fs.writeFileSync(outputPath, serializeEnv(result.patched), 'utf-8');
        console.log(`Written to ${outputPath}`);
      } else {
        console.log('\nDry run — no files written.');
      }
    });
}
