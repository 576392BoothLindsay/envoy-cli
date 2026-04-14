import { Argv } from 'yargs';
import fs from 'fs';
import path from 'path';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import {
  transformKeys,
  transformValues,
  formatTransformResult,
  TransformStrategy,
} from '../../transform/envTransformer';

export function registerTransformCommand(yargs: Argv): Argv {
  return yargs.command(
    'transform <file>',
    'Transform keys or values in a .env file',
    (y) =>
      y
        .positional('file', {
          describe: 'Path to the .env file',
          type: 'string',
          demandOption: true,
        })
        .option('target', {
          alias: 't',
          describe: 'Transform keys or values',
          choices: ['keys', 'values'] as const,
          default: 'keys',
        })
        .option('strategy', {
          alias: 's',
          describe: 'Transformation strategy',
          choices: ['uppercase', 'lowercase', 'prefix', 'suffix', 'trim'] as const,
          demandOption: true,
        })
        .option('prefix', { type: 'string', describe: 'Prefix to apply (for prefix strategy)' })
        .option('suffix', { type: 'string', describe: 'Suffix to apply (for suffix strategy)' })
        .option('keys', { type: 'array', string: true, describe: 'Specific keys to target' })
        .option('output', { alias: 'o', type: 'string', describe: 'Output file (defaults to stdout)' }),
    (argv) => {
      const filePath = path.resolve(argv.file as string);
      if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
      }

      const raw = fs.readFileSync(filePath, 'utf-8');
      const env = parseEnv(raw);

      const options = {
        strategy: argv.strategy as TransformStrategy,
        prefix: argv.prefix,
        suffix: argv.suffix,
        targetKeys: argv.keys as string[] | undefined,
      };

      const result =
        argv.target === 'values'
          ? transformValues(env, options)
          : transformKeys(env, options);

      const serialized = serializeEnv(result.transformed);

      if (argv.output) {
        const outPath = path.resolve(argv.output as string);
        fs.writeFileSync(outPath, serialized, 'utf-8');
        console.log(formatTransformResult(result));
        console.log(`Written to ${outPath}`);
      } else {
        console.log(serialized);
        console.error(formatTransformResult(result));
      }
    }
  );
}
