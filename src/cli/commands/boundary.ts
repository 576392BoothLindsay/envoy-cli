import type { Argv } from 'yargs';
import { readFileSync } from 'fs';
import { parseEnv } from '../../parser/envParser';
import { checkBoundaries, formatBoundaryResult, BoundaryRules } from '../../boundary/envBoundary';

export function registerBoundaryCommand(cli: Argv): void {
  cli.command(
    'boundary <file>',
    'Check env values against boundary rules (min/max length, pattern)',
    (yargs) =>
      yargs
        .positional('file', { type: 'string', demandOption: true, describe: '.env file to check' })
        .option('rules', {
          type: 'string',
          describe: 'JSON string of boundary rules, e.g. \'{"PORT":{"min":1,"max":5}}\'',
        })
        .option('rules-file', {
          type: 'string',
          describe: 'Path to JSON file containing boundary rules',
        }),
    (argv) => {
      const content = readFileSync(argv.file as string, 'utf-8');
      const env = parseEnv(content);

      let rules: BoundaryRules = {};

      if (argv['rules-file']) {
        const raw = readFileSync(argv['rules-file'] as string, 'utf-8');
        rules = JSON.parse(raw);
      } else if (argv.rules) {
        rules = JSON.parse(argv.rules as string);
      }

      const results = checkBoundaries(env, rules);
      console.log(formatBoundaryResult(results));

      const hasViolations = results.some((r) => !r.withinBounds);
      if (hasViolations) process.exit(1);
    }
  );
}
