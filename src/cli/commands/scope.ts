import type { Argv } from "yargs";
import * as fs from "fs";
import { parseEnv } from "../../parser/envParser";
import { splitByScopes, flattenScope, formatScopeResult, extractScope } from "../../scope/envScope";

export function registerScopeCommand(yargs: Argv): Argv {
  return yargs.command(
    "scope <file>",
    "Split or extract env keys by scope prefix",
    (y) =>
      y
        .positional("file", {
          describe: "Path to .env file",
          type: "string",
          demandOption: true,
        })
        .option("scopes", {
          alias: "s",
          type: "array",
          string: true,
          describe: "Scope prefixes to extract (e.g. DB REDIS)",
          demandOption: true,
        })
        .option("extract", {
          alias: "e",
          type: "string",
          describe: "Extract a single scope and output as .env",
        })
        .option("rename", {
          alias: "r",
          type: "string",
          describe: "Rename prefix when using --extract",
        })
        .option("output", {
          alias: "o",
          type: "string",
          describe: "Write output to a file instead of stdout",
        }),
    (argv) => {
      const raw = fs.readFileSync(argv.file as string, "utf-8");
      const env = parseEnv(raw);
      const scopes = argv.scopes as string[];

      if (argv.extract) {
        const scopeResult = extractScope(env, argv.extract as string);
        const flat = flattenScope(scopeResult, argv.rename as string | undefined);
        const lines = Object.entries(flat)
          .map(([k, v]) => `${k}=${v}`)
          .join("\n");

        if (argv.output) {
          fs.writeFileSync(argv.output as string, lines + "\n", "utf-8");
          console.log(`Wrote ${Object.keys(flat).length} keys to ${argv.output}`);
        } else {
          console.log(lines);
        }
        return;
      }

      const result = splitByScopes(env, scopes);
      const formatted = formatScopeResult(result);

      if (argv.output) {
        fs.writeFileSync(argv.output as string, formatted + "\n", "utf-8");
        console.log(`Scope report written to ${argv.output}`);
      } else {
        console.log(formatted);
      }
    }
  );
}
