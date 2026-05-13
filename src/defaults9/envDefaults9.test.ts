import { describe, it, expect } from "vitest";
import {
  applyDefaults9,
  getMissingDefaults9,
  formatDefaults9Result,
} from "./envDefaults9";

describe("applyDefaults9", () => {
  it("applies defaults for missing keys", () => {
    const env = { EXISTING: "value" };
    const defaults = { EXISTING: "default", NEW_KEY: "new_value" };
    const result = applyDefaults9(env, defaults);
    expect(result.env["EXISTING"]).toBe("value");
    expect(result.env["NEW_KEY"]).toBe("new_value");
    expect(result.applied["NEW_KEY"]).toBe("new_value");
    expect(result.skipped).toContain("EXISTING");
  });

  it("applies defaults for empty string values", () => {
    const env = { EMPTY_KEY: "" };
    const defaults = { EMPTY_KEY: "fallback" };
    const result = applyDefaults9(env, defaults);
    expect(result.env["EMPTY_KEY"]).toBe("fallback");
    expect(result.applied["EMPTY_KEY"]).toBe("fallback");
  });

  it("does not override non-empty existing values", () => {
    const env = { KEY: "original" };
    const defaults = { KEY: "override" };
    const result = applyDefaults9(env, defaults);
    expect(result.env["KEY"]).toBe("original");
    expect(result.skipped).toContain("KEY");
    expect(Object.keys(result.applied)).toHaveLength(0);
  });

  it("returns empty applied and skipped when defaults is empty", () => {
    const env = { A: "1" };
    const result = applyDefaults9(env, {});
    expect(result.applied).toEqual({});
    expect(result.skipped).toHaveLength(0);
  });

  it("does not mutate the original env", () => {
    const env = { A: "1" };
    applyDefaults9(env, { B: "2" });
    expect(env).toEqual({ A: "1" });
  });
});

describe("getMissingDefaults9", () => {
  it("returns keys that are missing or empty", () => {
    const env = { A: "val", B: "" };
    const defaults = { A: "a", B: "b", C: "c" };
    const missing = getMissingDefaults9(env, defaults);
    expect(missing).toContain("B");
    expect(missing).toContain("C");
    expect(missing).not.toContain("A");
  });
});

describe("formatDefaults9Result", () => {
  it("formats applied and skipped keys", () => {
    const result = {
      env: { A: "1", B: "default" },
      applied: { B: "default" },
      skipped: ["A"],
    };
    const output = formatDefaults9Result(result);
    expect(output).toContain("Applied 1 default(s)");
    expect(output).toContain("+ B=default");
    expect(output).toContain("Skipped 1 key(s)");
    expect(output).toContain("~ A");
  });

  it("shows 'No defaults applied' when nothing was applied", () => {
    const result = { env: { A: "1" }, applied: {}, skipped: ["A"] };
    const output = formatDefaults9Result(result);
    expect(output).toContain("No defaults applied.");
  });
});
