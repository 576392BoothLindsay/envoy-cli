import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { applyLowercase, getLowercaseResult, formatLowercaseResult, LowercaseTarget } from '../../lowercase/envLowercase';

export function registerLowercaseCommand(program: Command): void {
  program
    .command('lowercase <file>')
    .description('Lowercase keys, values, or both in a .env file')
    .option('-t, --target <target>', 'Target to lowercase: keys, values, or both', 'keys')
    .option('-o, --output <file>', 'Output file (defaults to input file)')
    .option('--dry-run', 'Preview changes without writing')
    .action((file: string, options: { target: string; output?: string; dryRun?: boolean }) => {
      const target = options.target as LowercaseTarget;
      if (!['keys', 'values', 'both'].includes(target)) {
        console.error(`Invalid target "${target}". Use: keys, values, or both.`);
        process.exit(1);
      }

      const raw = readFileSync(file, 'utf-8');
      const env = parseEnv(raw);
      const result = getLowercaseResult(env, target);

      if (options.dryRun) {
        console.log(formatLowercaseResult(result));
        return;
      }

      const transformed = applyLowercase(env, target);
      const output = serializeEnv(transformed);
      const outFile = options.output ?? file;
      writeFileSync(outFile, output, 'utf-8');
      console.log(formatLowercaseResult(result));
      console.log(`Written to ${outFile}`);
    });
}
