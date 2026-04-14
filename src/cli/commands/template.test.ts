import * as fs from "fs";
import * as path from "path";
import { registerTemplateCommand } from "./template";
import yargs from "yargs";

jest.mock("fs");

const mockFs = fs as jest.Mocked<typeof fs>;

const sampleEnvContent = "DB_HOST=localhost\nDB_PORT=5432\nAPP_NAME=myapp\n";

describe("registerTemplateCommand", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(sampleEnvContent as any);
  });

  it("registers the template command", () => {
    const cli = yargs();
    const result = registerTemplateCommand(cli);
    expect(result).toBeDefined();
  });

  it("outputs template to stdout when no output specified", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    jest.spyOn(console, "error").mockImplementation();

    const cli = registerTemplateCommand(yargs());
    cli.parse(["template", ".env"]);

    expect(mockFs.readFileSync).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("writes to output file when specified", () => {
    jest.spyOn(console, "log").mockImplementation();
    jest.spyOn(console, "error").mockImplementation();
    mockFs.writeFileSync.mockImplementation(() => {});

    const cli = registerTemplateCommand(yargs());
    cli.parse(["template", ".env", "--output", ".env.template"]);

    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining(".env.template"),
      expect.any(String),
      "utf-8"
    );
  });

  it("exits with error when input file not found", () => {
    mockFs.existsSync.mockReturnValue(false);
    const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit");
    });
    jest.spyOn(console, "error").mockImplementation();

    const cli = registerTemplateCommand(yargs());
    expect(() => cli.parse(["template", "missing.env"])).toThrow();
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });
});
