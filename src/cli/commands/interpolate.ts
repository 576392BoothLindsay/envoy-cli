import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { interpolateEnv, getUnresolvedKeys } from '../../interpolate/envInterpolator';

export function registerInterpolateCommand(program: Command): void {
  program
    .command('interpolate <file>')
    .description('Resolve variable references (e.g. ${VAR}) within a .env file')
    .option('-o, --output <path>', 'Write interpolated output to a file instead of stdout')
    .option('--strict', 'Fail if any variable references cannot be resolved', false)
    .option('--check', 'Only report unresolved keys without modifying output', false)
    .action((file: string, options: { output?: string; strict: boolean; check: boolean }) => {
      let raw: string;
      try {
        raw = readFileSync(file, 'utf-8');
      } catch {
        console.error(`Error: Could not read file "${file}"`);
        process.exit(1);
      }

      const env = parseEnv(raw);
      const unresolved = getUnresolvedKeys(env);

      if (options.check) {
        if (unresolved.length === 0) {
          console.log('All variable references are resolvable.');
        } else {
          console.warn('Unresolved variable references:');
          unresolved.forEach((key) => console.warn(`  ${key}`));
          process.exit(1);
        }
        return;
      }

      if (options.strict && unresolved.length > 0) {
        console.error('Error: Unresolved variable references found (--strict mode):');
        unresolved.forEach((key) => console.error(`  ${key}`));
        process.exit(1);
      }

      const interpolated = interpolateEnv(env);
      const output = serializeEnv(interpolated);

      if (options.output) {
        try {
          writeFileSync(options.output, output, 'utf-8');
          console.log(`Interpolated env written to "${options.output}"`);
        } catch {
          console.error(`Error: Could not write to "${options.output}"`);
          process.exit(1);
        }
      } else {
        process.stdout.write(output);
      }
    });
}
