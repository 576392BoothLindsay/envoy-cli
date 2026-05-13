import { Command } from "commander";
import { readFileSync, writeFileSync } from "fs";
import { parseEnv, serializeEnv } from "../../parser/envParser";
import {
  applyDefaults9,
  formatDefaults9Result,
} from "../../defaults9/envDefaults9";

export function registerDefaults9Command(program: Command): void {
  program
    .command("defaults9 <envFile>")
    .description(
      "Apply default values for missing or empty keys in a .env file"
    )
    .option(
      "-d, --defaults <pairs...>",
      "Default key=value pairs to apply (e.g. KEY=value)"
    )
    .option("-o, --output <file>", "Write result to a file instead of stdout")
    .option("--in-place", "Overwrite the source file with the result")
    .action(
      (
        envFile: string,
        options: {
          defaults?: string[];
          output?: string;
          inPlace?: boolean;
        }
      ) => {
        const raw = readFileSync(envFile, "utf-8");
        const env = parseEnv(raw);

        const defaults: Record<string, string> = {};
        for (const pair of options.defaults ?? []) {
          const idx = pair.indexOf("=");
          if (idx === -1) {
            console.error(`Invalid default pair (missing '='): ${pair}`);
            process.exit(1);
          }
          const key = pair.slice(0, idx).trim();
          const value = pair.slice(idx + 1).trim();
          defaults[key] = value;
        }

        const result = applyDefaults9(env, defaults);
        const serialized = serializeEnv(result.env);

        if (options.inPlace) {
          writeFileSync(envFile, serialized, "utf-8");
        } else if (options.output) {
          writeFileSync(options.output, serialized, "utf-8");
        } else {
          console.log(serialized);
        }

        console.error(formatDefaults9Result(result));
      }
    );
}
