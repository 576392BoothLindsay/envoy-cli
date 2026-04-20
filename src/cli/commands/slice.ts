import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { sliceEnv, sliceByCount, formatSliceResult } from '../../slice/envSlicer';

export function registerSliceCommand(program: Command): void {
  program
    .command('slice <file>')
    .description('Slice a .env file by key index range')
    .option('-s, --start <number>', 'Start index (inclusive, supports negative)', '0')
    .option('-e, --end <number>', 'End index (exclusive, supports negative)')
    .option('--first <number>', 'Take first N keys')
    .option('--last <number>', 'Take last N keys')
    .option('-o, --output <file>', 'Write result to file instead of stdout')
    .option('--json', 'Output as JSON')
    .action((file: string, options) => {
      const raw = readFileSync(file, 'utf-8');
      const env = parseEnv(raw);

      let result;

      if (options.first !== undefined) {
        result = sliceByCount(env, parseInt(options.first, 10), 'first');
      } else if (options.last !== undefined) {
        result = sliceByCount(env, parseInt(options.last, 10), 'last');
      } else {
        const start = parseInt(options.start, 10);
        const end = options.end !== undefined ? parseInt(options.end, 10) : undefined;
        result = sliceEnv(env, start, end);
      }

      if (options.output) {
        const serialized = options.json
          ? JSON.stringify(result.sliced, null, 2)
          : serializeEnv(result.sliced);
        writeFileSync(options.output, serialized, 'utf-8');
        console.log(`Wrote ${Object.keys(result.sliced).length} keys to ${options.output}`);
      } else if (options.json) {
        console.log(JSON.stringify(result.sliced, null, 2));
      } else {
        console.log(formatSliceResult(result));
      }
    });
}
