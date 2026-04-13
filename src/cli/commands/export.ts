import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { parseEnv } from '../../parser/envParser';
import { exportEnv, parseExportFormat } from '../../export/envExporter';

export function registerExportCommand(program: Command): void {
  program
    .command('export <file>')
    .description('Export a .env file in a specified format (dotenv, json, shell)')
    .option('-f, --format <format>', 'Output format: dotenv | json | shell', 'dotenv')
    .option('-r, --redact', 'Redact secret values before exporting', false)
    .option('-o, --output <path>', 'Write output to a file instead of stdout')
    .action((file: string, options: { format: string; redact: boolean; output?: string }) => {
      const filePath = path.resolve(process.cwd(), file);

      if (!fs.existsSync(filePath)) {
        console.error(`Error: File not found: ${filePath}`);
        process.exit(1);
      }

      let format;
      try {
        format = parseExportFormat(options.format);
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }

      const raw = fs.readFileSync(filePath, 'utf-8');
      const env = parseEnv(raw);
      const output = exportEnv(env, { format, redact: options.redact });

      if (options.output) {
        const outPath = path.resolve(process.cwd(), options.output);
        fs.writeFileSync(outPath, output, 'utf-8');
        console.log(`Exported to ${outPath}`);
      } else {
        console.log(output);
      }
    });
}
