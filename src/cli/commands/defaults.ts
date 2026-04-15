import type { Argv } from "yargs";
import fs from "fs";
import { parseEnv, serializeEnv } from "../../parser/envParser";
import { applyDefaults, formatDefaultsResult } from "../../defaults/envDefaults";

export function registerDefaultsCommand(yargs: Argv): Argv {
  return yargs.command(
    "defaults <target> <defaults>",
    "Apply default values from a defaults file to a target .env file",
    (y) =>
      y
        .positional("target", {
          describe: "Path to the target .env file",
          type: "string",
          demandOption: true,
        })
        .positional("defaults", {
          describe: "Path to the defaults .env file",
          type: "string",
          demandOption: true,
        })
        .option("output", {
          alias: "o",
          type: "string",
          describe: "Write merged output to this file (defaults to stdout)",
        })
        .option("no-overwrite-empty", {
          type: "boolean",
          default: false,
          describe: "Do not overwrite keys with empty values",
        })
        .option("dry-run", {
          type: "boolean",
          default: false,
          describe: "Show what would be applied without writing changes",
        }),
    (argv) => {
      const targetContent = fs.readFileSync(argv.target as string, "utf-8");
      const defaultsContent = fs.readFileSync(argv.defaults as string, "utf-8");

      const targetEnv = parseEnv(targetContent);
      const defaultsEnv = parseEnv(defaultsContent);

      const overwriteEmpty = !(argv["no-overwrite-empty"] as boolean);
      const result = applyDefaults(targetEnv, defaultsEnv, overwriteEmpty);

      console.log(formatDefaultsResult(result));

      if (!argv["dry-run"]) {
        const serialized = serializeEnv(result.merged);
        if (argv.output) {
          fs.writeFileSync(argv.output as string, serialized, "utf-8");
          console.log(`\nWritten to ${argv.output}`);
        } else {
          console.log("\n" + serialized);
        }
      }
    }
  );
}
