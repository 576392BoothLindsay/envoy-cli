import fs from "fs";
import path from "path";
import os from "os";

const tmpDir = os.tmpdir();

function writeTempEnv(name: string, content: string): string {
  const filePath = path.join(tmpDir, name);
  fs.writeFileSync(filePath, content, "utf-8");
  return filePath;
}

function cleanup(...files: string[]) {
  for (const f of files) {
    if (fs.existsSync(f)) fs.unlinkSync(f);
  }
}

describe("registerDefaultsCommand (integration)", () => {
  it("applies defaults to target env and writes output", () => {
    const targetPath = writeTempEnv("target.env", "A=1\nB=\n");
    const defaultsPath = writeTempEnv("defaults.env", "B=default_b\nC=default_c\n");
    const outputPath = path.join(tmpDir, "merged.env");

    const { parseEnv } = require("../../parser/envParser");
    const { applyDefaults } = require("../../defaults/envDefaults");

    const target = parseEnv(fs.readFileSync(targetPath, "utf-8"));
    const defaults = parseEnv(fs.readFileSync(defaultsPath, "utf-8"));
    const result = applyDefaults(target, defaults, true);

    expect(result.merged.A).toBe("1");
    expect(result.merged.B).toBe("default_b");
    expect(result.merged.C).toBe("default_c");
    expect(result.applied).toHaveProperty("B");
    expect(result.applied).toHaveProperty("C");
    expect(result.skipped).toHaveProperty("A");

    cleanup(targetPath, defaultsPath, outputPath);
  });

  it("does not overwrite non-empty values", () => {
    const { applyDefaults } = require("../../defaults/envDefaults");
    const result = applyDefaults({ X: "existing" }, { X: "default" }, true);
    expect(result.merged.X).toBe("existing");
    expect(result.skipped).toHaveProperty("X");
  });
});
