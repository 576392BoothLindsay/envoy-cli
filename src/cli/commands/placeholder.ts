import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import {
  resolvePlaceholders,
  formatPlaceholderResult,
  PlaceholderOptions,
} from '../../placeholder/envPlaceholder';

export function registerPlaceholderCommand(program: Command): void {
  program
    .command('placeholder <envFile>')
    .description('Resolve {{PLACEHOLDER}} tokens in an .env file using a context file or inline values')
    .option('-c, --context <file>', 'Path to a .env file used as the placeholder context')
    .option('-s, --set <pairs...>', 'Inline key=value pairs for context (e.g. HOST=localhost)')
    .option('--prefix <prefix>', 'Placeholder prefix (default: {{)')
    .option('--suffix <suffix>', 'Placeholder suffix (default: }})')
    .option('--fallback <value>', 'Fallback value for unresolved placeholders')
    .option('-o, --output <file>', 'Write resolved output to a file instead of stdout')
    .option('--json', 'Output result as JSON')
    .action((envFile: string, opts) => {
      let source: Record<string, string>;
      try {
        source = parseEnv(readFileSync(envFile, 'utf-8'));
      } catch {
        console.error(`Error: Could not read env file: ${envFile}`);
        process.exit(1);
      }

      const context: Record<string, string> = {};

      if (opts.context) {
        try {
          Object.assign(context, parseEnv(readFileSync(opts.context, 'utf-8')));
        } catch {
          console.error(`Error: Could not read context file: ${opts.context}`);
          process.exit(1);
        }
      }

      if (opts.set) {
        for (const pair of opts.set as string[]) {
          const idx = pair.indexOf('=');
          if (idx === -1) {
            console.error(`Error: Invalid key=value pair: ${pair}`);
            process.exit(1);
          }
          context[pair.slice(0, idx)] = pair.slice(idx + 1);
        }
      }

      const options: PlaceholderOptions = {
        prefix: opts.prefix,
        suffix: opts.suffix,
        fallback: opts.fallback,
      };

      const result = resolvePlaceholders(source, context, options);

      if (opts.output) {
        writeFileSync(opts.output, serializeEnv(result.resolved), 'utf-8');
        console.log(formatPlaceholderResult(result));
      } else if (opts.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(serializeEnv(result.resolved));
        console.error(formatPlaceholderResult(result));
      }

      if (result.missing.length > 0) process.exit(1);
    });
}
