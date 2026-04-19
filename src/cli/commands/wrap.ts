import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { wrapEnv, formatWrapResult } from '../../wrap/envWrapper';

export function registerWrapCommand(program: Command): void {
  program
    .command('wrap <file>')
    .description('Wrap values of specified keys with prefix, suffix, or quotes')
    .requiredOption('-k, --keys <keys>', 'Comma-separated list of keys to wrap')
    .option('--prefix <prefix>', 'Prefix to prepend to values')
    .option('--suffix <suffix>', 'Suffix to append to values')
    .option('--quote <type>', 'Quote style: single, double, or none', 'none')
    .option('-o, --output <file>', 'Output file (defaults to stdout)')
    .option('--write', 'Write result back to input file')
    .action((file, opts) => {
      const content = readFileSync(file, 'utf-8');
      const env = parseEnv(content);
      const keys = opts.keys.split(',').map((k: string) => k.trim());

      const quoteOpt = opts.quote === 'none' ? undefined : opts.quote;

      const result = wrapEnv(env, keys, {
        prefix: opts.prefix,
        suffix: opts.suffix,
        quote: quoteOpt,
      });

      if (opts.write) {
        writeFileSync(file, serializeEnv(result.wrapped));
        console.log(formatWrapResult(result));
      } else if (opts.output) {
        writeFileSync(opts.output, serializeEnv(result.wrapped));
        console.log(formatWrapResult(result));
      } else {
        console.log(serializeEnv(result.wrapped));
      }
    });
}
