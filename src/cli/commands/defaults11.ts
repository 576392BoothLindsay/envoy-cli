import { Command } from "commander";
import * as fs from "fs";
import { parseEnv, serializeEnv } from "../../parser/envParser";
import {
  applyDefaults11,
  formatDefaults11Result,
} from "../../defaults11/envDefaults11";

export function registerDefaults11Command(program: Command): void {
  program
    .command("defaults11 <file>")
    .description(
      "Apply default values for missing (or empty) keys in an .env file"
    )
    .option(
      "-d, --default <pairs...>",
      "KEY=VALUE pairs to use as defaults"
    )
    .option(
      "--overwrite-empty",
      "Replace empty-string values with the default",
      false
    )
    .option("-o, --output <file>", "Write result to file instead of stdout")
    .action(
      (
        file: string,
        opts: {
          default?: string[];
          overwriteEmpty: boolean;
          output?: string;
        }
      ) => {
        const raw = fs.readFileSync(file, "utf-8");
        const env = parseEnv(raw);

        const defaults: Record<string, string> = {};
        for (const pair of opts.default ?? []) {
          const idx = pair.indexOf("=");
          if (idx === -1) {
            console.error(`Invalid default pair: ${pair}`);
            process.exit(1);
          }
          defaults[pair.slice(0, idx)] = pair.slice(idx + 1);
        }

        const result = applyDefaults11(env, defaults, opts.overwriteEmpty);
        console.error(formatDefaults11Result(result));

        const serialized = serializeEnv(result.env);
        if (opts.output) {
          fs.writeFileSync(opts.output, serialized, "utf-8");
        } else {
          process.stdout.write(serialized);
        }
      }
    );
}
