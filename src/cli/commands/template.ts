import type { Argv } from "yargs";
import * as fs from "fs";
import * as path from "path";
import { parseEnv } from "../../parser/envParser";
import { generateTemplate, formatTemplateResult } from "../../template/envTemplate";

interface TemplateArgs {
  input: string;
  output?: string;
  placeholder: string;
  comments: boolean;
  "group-by-prefix": boolean;
}

export function registerTemplateCommand(yargs: Argv): Argv {
  return yargs.command<TemplateArgs>(
    "template <input>",
    "Generate a .env template with empty or placeholder values",
    (y) =>
      y
        .positional("input", {
          describe: "Source .env file to generate template from",
          type: "string",
          demandOption: true,
        })
        .option("output", {
          alias: "o",
          describe: "Output file path (defaults to stdout)",
          type: "string",
        })
        .option("placeholder", {
          alias: "p",
          describe: "Placeholder value for each key",
          type: "string",
          default: "",
        })
        .option("comments", {
          describe: "Include comments in the template",
          type: "boolean",
          default: true,
        })
        .option("group-by-prefix", {
          describe: "Group keys by their prefix",
          type: "boolean",
          default: false,
        }),
    (argv) => {
      const inputPath = path.resolve(argv.input);
      if (!fs.existsSync(inputPath)) {
        console.error(`Error: File not found: ${inputPath}`);
        process.exit(1);
      }

      const raw = fs.readFileSync(inputPath, "utf-8");
      const env = parseEnv(raw);

      const result = generateTemplate(env, {
        placeholder: argv.placeholder,
        includeComments: argv.comments,
        groupByPrefix: argv["group-by-prefix"],
      });

      if (argv.output) {
        const outputPath = path.resolve(argv.output);
        fs.writeFileSync(outputPath, result.content, "utf-8");
        console.log(`Template written to ${outputPath}`);
      } else {
        console.log(result.content);
      }

      console.error(formatTemplateResult(result));
    }
  );
}
