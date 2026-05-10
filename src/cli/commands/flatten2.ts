import { Command } from "commander";
import * as fs from "fs";
import { parseEnv, serializeEnv } from "../../parser/envParser";
import { flattenEnv2, formatFlatten2Result } from "../../flatten2/envFlattener2";

export function registerFlatten2Command(program: Command): void {
  program
    .command("flatten2 <file>")
    .description(
      "Flatten JSON-encoded values in a .env file into individual keys"
    )
    .option("-s, --separator <char>", "Key separator", "_")
    .option("-o, --output <file>", "Write result to file instead of stdout")
    .option("--json", "Output as JSON")
    .action(
      (
        file: string,
        options: { separator: string; output?: string; json?: boolean }
      ) => {
        if (!fs.existsSync(file)) {
          console.error(`File not found: ${file}`);
          process.exit(1);
        }

        const raw = fs.readFileSync(file, "utf-8");
        const env = parseEnv(raw);
        const result = flattenEnv2(env, options.separator);

        if (options.json) {
          console.log(JSON.stringify(result.flattened, null, 2));
          return;
        }

        const serialized = serializeEnv(result.flattened);

        if (options.output) {
          fs.writeFileSync(options.output, serialized, "utf-8");
          console.log(formatFlatten2Result(result));
          console.log(`\nWritten to ${options.output}`);
        } else {
          console.log(formatFlatten2Result(result));
          console.log("\n" + serialized);
        }
      }
    );
}
