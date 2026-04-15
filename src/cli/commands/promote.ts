import { Command } from 'commander';
import * as fs from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { promoteEnv, formatPromoteResult, PromoteStrategy } from '../../promote/envPromote';

export function registerPromoteCommand(program: Command): void {
  program
    .command('promote <source> <target>')
    .description('Promote env variables from a source file into a target file')
    .option('-s, --strategy <strategy>', 'Promotion strategy: overwrite | skip | merge', 'overwrite')
    .option('-k, --keys <keys>', 'Comma-separated list of keys to promote')
    .option('-e, --exclude <keys>', 'Comma-separated list of keys to exclude')
    .option('-o, --output <file>', 'Output file (defaults to overwriting target)')
    .option('--dry-run', 'Preview changes without writing to disk')
    .action((sourcePath: string, targetPath: string, opts) => {
      if (!fs.existsSync(sourcePath)) {
        console.error(`Source file not found: ${sourcePath}`);
        process.exit(1);
      }
      if (!fs.existsSync(targetPath)) {
        console.error(`Target file not found: ${targetPath}`);
        process.exit(1);
      }

      const validStrategies = ['overwrite', 'skip', 'merge'];
      if (!validStrategies.includes(opts.strategy)) {
        console.error(`Invalid strategy "${opts.strategy}". Choose from: ${validStrategies.join(', ')}`);
        process.exit(1);
      }

      const source = parseEnv(fs.readFileSync(sourcePath, 'utf-8'));
      const target = parseEnv(fs.readFileSync(targetPath, 'utf-8'));

      const keys = opts.keys ? opts.keys.split(',').map((k: string) => k.trim()) : undefined;
      const excludeKeys = opts.exclude ? opts.exclude.split(',').map((k: string) => k.trim()) : [];

      const { result, summary } = promoteEnv(source, target, {
        strategy: opts.strategy as PromoteStrategy,
        keys,
        excludeKeys,
      });

      console.log(formatPromoteResult(summary));

      if (opts.dryRun) {
        console.log('\n[Dry run] No files were written.');
        return;
      }

      const outputPath = opts.output ?? targetPath;
      fs.writeFileSync(outputPath, serializeEnv(result), 'utf-8');
      console.log(`\nWrote promoted env to: ${outputPath}`);
    });
}
