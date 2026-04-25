import { Command } from 'commander';
import * as fs from 'fs';
import { parseEnv } from '../../parser/envParser';
import { highlightEnv, formatHighlightResult, HighlightTheme } from '../../highlight/envHighlighter';

export function registerHighlightCommand(program: Command): void {
  program
    .command('highlight <file>')
    .description('Syntax-highlight a .env file for terminal or HTML output')
    .option('-t, --theme <theme>', 'Output theme: ansi, html, or plain', 'ansi')
    .option('-k, --keys <keys>', 'Comma-separated list of keys to highlight')
    .option('-v, --values <values>', 'Comma-separated list of values to highlight')
    .option('--no-dim-comments', 'Do not dim comment lines')
    .option('-o, --output <file>', 'Write output to file instead of stdout')
    .action((file: string, opts) => {
      if (!fs.existsSync(file)) {
        console.error(`File not found: ${file}`);
        process.exit(1);
      }

      const raw = fs.readFileSync(file, 'utf-8');
      const theme = (opts.theme as HighlightTheme) || 'ansi';

      const highlightKeys: string[] = opts.keys
        ? opts.keys.split(',').map((k: string) => k.trim()).filter(Boolean)
        : [];

      const highlightValues: string[] = opts.values
        ? opts.values.split(',').map((v: string) => v.trim()).filter(Boolean)
        : [];

      const dimComments = opts.dimComments !== false;

      const result = highlightEnv(raw, {
        theme,
        highlightKeys,
        highlightValues,
        dimComments,
      });

      const output = formatHighlightResult(result);

      if (opts.output) {
        fs.writeFileSync(opts.output, output, 'utf-8');
        console.log(`Highlighted output written to ${opts.output}`);
      } else {
        process.stdout.write(output);
      }

      if (result.matchedKeys.length > 0 || result.matchedValues.length > 0) {
        const parts: string[] = [];
        if (result.matchedKeys.length > 0) {
          parts.push(`keys: ${result.matchedKeys.join(', ')}`);
        }
        if (result.matchedValues.length > 0) {
          parts.push(`values: ${result.matchedValues.join(', ')}`);
        }
        console.error(`\nHighlighted ${parts.join(' | ')}`);
      }
    });
}
