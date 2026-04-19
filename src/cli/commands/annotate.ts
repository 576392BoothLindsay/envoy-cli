import type { Argv } from 'yargs';
import fs from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { addAnnotations, serializeWithAnnotations, formatAnnotateResult } from '../../annotate/envAnnotator';

export function registerAnnotateCommand(cli: Argv): void {
  cli.command(
    'annotate <file>',
    'Add inline comments/annotations to .env keys',
    (yargs) =>
      yargs
        .positional('file', { type: 'string', demandOption: true, describe: '.env file to annotate' })
        .option('key', { type: 'array', string: true, describe: 'Keys to annotate (key=comment format)' })
        .option('output', { type: 'string', alias: 'o', describe: 'Output file (defaults to stdout)' })
        .option('print', { type: 'boolean', default: false, describe: 'Print result to stdout' }),
    (argv) => {
      const raw = fs.readFileSync(argv.file as string, 'utf-8');
      const env = parseEnv(raw);

      const annotations = ((argv.key as string[]) || []).map((entry) => {
        const idx = entry.indexOf('=');
        if (idx === -1) return { key: entry, comment: '' };
        return { key: entry.slice(0, idx), comment: entry.slice(idx + 1) };
      });

      const result = addAnnotations(env, annotations);
      const serialized = serializeWithAnnotations(result.annotated, result.comments);

      if (argv.output) {
        fs.writeFileSync(argv.output as string, serialized, 'utf-8');
        console.log(formatAnnotateResult(result));
      } else {
        console.log(serialized);
      }
    }
  );
}
