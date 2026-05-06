import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { squeezeEnv, formatSqueezeResult } from '../../squeeze/envSqueezer';

export function registerSqueezeCommand(program: Command): void {
  program
    .command('squeeze <file>')
    .description('Remove blank or empty values from an env file')
    .option('-o, --output <file>', 'Write result to file instead of stdout')
    .option('--in-place', 'Overwrite the input file with the result')
    .option('--show-removed', 'Show which keys were removed', false)
    .action((file: string, options: { output?: string; inPlace?: boolean; showRemoved?: boolean }) => {
      const raw = readFileSync(file, 'utf-8');
      const env = parseEnv(raw);
      const result = squeezeEnv(env);

      if (options.showRemoved) {
        console.log(formatSqueezeResult(result));
      }

      const serialized = serializeEnv(result.squeezed);

      if (options.inPlace) {
        writeFileSync(file, serialized, 'utf-8');
        console.log(`Squeezed ${result.removedKeys.length} blank key(s) in ${file}`);
      } else if (options.output) {
        writeFileSync(options.output, serialized, 'utf-8');
        console.log(`Wrote squeezed env to ${options.output}`);
      } else {
        process.stdout.write(serialized);
      }
    });
}
