import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { shuffleEnv, formatShuffleResult } from '../../shuffle/envShuffler';

export function registerShuffleCommand(program: Command): void {
  program
    .command('shuffle <file>')
    .description('Randomly shuffle the order of keys in a .env file')
    .option('-s, --seed <number>', 'seed for deterministic shuffle')
    .option('-o, --output <file>', 'write result to file instead of stdout')
    .option('--in-place', 'overwrite the input file')
    .action((file: string, options: { seed?: string; output?: string; inPlace?: boolean }) => {
      const raw = readFileSync(file, 'utf-8');
      const env = parseEnv(raw);
      const seed = options.seed !== undefined ? parseInt(options.seed, 10) : undefined;
      const shuffled = shuffleEnv(env, seed);

      const result = {
        original: env,
        shuffled,
        count: Object.keys(env).length,
      };

      const serialized = serializeEnv(shuffled);

      if (options.inPlace) {
        writeFileSync(file, serialized, 'utf-8');
        console.log(formatShuffleResult(result));
      } else if (options.output) {
        writeFileSync(options.output, serialized, 'utf-8');
        console.log(formatShuffleResult(result));
      } else {
        console.log(formatShuffleResult(result));
        console.log('');
        console.log(serialized);
      }
    });
}
