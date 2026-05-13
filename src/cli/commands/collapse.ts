import { Command } from "commander";
import * as fs from "fs";
import { parseEnv, serializeEnv } from "../../parser/envParser";
import { collapseEnv, formatCollapseResult } from "../../collapse/envCollapser";

export function registerCollapseCommand(program: Command): void {
  program
    .command("collapse <file>")
    .description(
      "Collapse numeric-suffixed keys (e.g. HOST_1, HOST_2) into a single comma-separated key"
    )
    .option("-s, --separator <sep>", "Separator for collapsed values", ",")
    .option("-o, --output <file>", "Write result to file instead of stdout")
    .option("--json", "Output as JSON")
    .action((file: string, opts: { separator: string; output?: string; json?: boolean }) => {
      if (!fs.existsSync(file)) {
        console.error(`File not found: ${file}`);
        process.exit(1);
      }

      const raw = fs.readFileSync(file, "utf-8");
      const env = parseEnv(raw);
      const result = collapseEnv(env, opts.separator);

      if (opts.json) {
        const out = JSON.stringify(result.collapsed, null, 2);
        if (opts.output) {
          fs.writeFileSync(opts.output, out, "utf-8");
          console.log(`Written to ${opts.output}`);
        } else {
          console.log(out);
        }
        return;
      }

      if (opts.output) {
        const serialized = serializeEnv(result.collapsed);
        fs.writeFileSync(opts.output, serialized, "utf-8");
        console.log(`Written to ${opts.output}`);
      } else {
        console.log(formatCollapseResult(result));
      }
    });
}
