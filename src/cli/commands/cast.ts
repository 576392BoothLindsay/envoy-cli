import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { castEnv, formatCastResult, CastType } from '../../cast/envCaster';

export function registerCastCommand(program: Command): void {
  program
    .command('cast <file>')
    .description('Cast env variable values to typed representations')
    .option('-r, --rule <rules...>', 'Cast rules in KEY:TYPE format (e.g. PORT:number DEBUG:boolean)')
    .option('-o, --output <file>', 'Output file (default: overwrite input)')
    .option('--json', 'Output as JSON')
    .action((file: string, options: { rule?: string[]; output?: string; json?: boolean }) => {
      const raw = readFileSync(file, 'utf-8');
      const env = parseEnv(raw);

      const rules = (options.rule ?? []).map(r => {
        const [key, type] = r.split(':');
        if (!key || !type) {
          console.error(`Invalid rule: "${r}". Expected KEY:TYPE format.`);
          process.exit(1);
        }
        return { key, type: type as CastType };
      });

      if (rules.length === 0) {
        console.error('No cast rules provided. Use --rule KEY:TYPE');
        process.exit(1);
      }

      const result = castEnv(env, rules);

      if (options.json) {
        console.log(JSON.stringify(result.output, null, 2));
        return;
      }

      console.log(formatCastResult(result));

      if (result.failed.length > 0) {
        process.exit(1);
      }

      const outFile = options.output ?? file;
      const stringOutput: Record<string, string> = {};
      for (const [k, v] of Object.entries(result.output)) {
        stringOutput[k] = typeof v === 'object' ? JSON.stringify(v) : String(v);
      }
      writeFileSync(outFile, serializeEnv(stringOutput), 'utf-8');
    });
}
