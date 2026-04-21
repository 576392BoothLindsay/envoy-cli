import type { Argv } from 'yargs';
import { readFileSync } from 'fs';
import { parseEnv } from '../../parser/envParser';
import { computeDiff2, formatDiff2Result } from '../../diff2/envDiff2';
import type { DiffMode } from '../../diff2/envDiff2';

export function registerDiff2Command(yargs: Argv): Argv {
  return yargs.command(
    'diff2 <left> <right>',
    'Compute a detailed diff between two .env files',
    (y) =>
      y
        .positional('left', {
          describe: 'Path to the left (base) .env file',
          type: 'string',
          demandOption: true,
        })
        .positional('right', {
          describe: 'Path to the right (target) .env file',
          type: 'string',
          demandOption: true,
        })
        .option('mode', {
          alias: 'm',
          describe: 'Diff mode: symmetric | left | right',
          type: 'string',
          default: 'symmetric',
          choices: ['symmetric', 'left', 'right'],
        })
        .option('show-unchanged', {
          alias: 'u',
          describe: 'Include unchanged keys in output',
          type: 'boolean',
          default: false,
        }),
    (argv) => {
      const leftContent = readFileSync(argv.left as string, 'utf-8');
      const rightContent = readFileSync(argv.right as string, 'utf-8');

      const leftEnv = parseEnv(leftContent);
      const rightEnv = parseEnv(rightContent);

      const result = computeDiff2(
        leftEnv,
        rightEnv,
        argv.mode as DiffMode
      );

      const output = formatDiff2Result(result, argv['show-unchanged'] as boolean);
      console.log(output);

      if (result.changed > 0 || result.added > 0 || result.removed > 0) {
        process.exitCode = 1;
      }
    }
  );
}
