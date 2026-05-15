import {
  applyDefaults11,
  getMissingDefaults11,
  formatDefaults11Result,
} from "./envDefaults11";

describe("applyDefaults11", () => {
  const base = { A: "1", B: "2" };
  const defaults = { B: "20", C: "30", D: "40" };

  it("applies defaults for missing keys", () => {
    const { env, applied, skipped } = applyDefaults11(base, defaults);
    expect(env.C).toBe("30");
    expect(env.D).toBe("40");
    expect(applied).toContain("C");
    expect(applied).toContain("D");
  });

  it("skips keys that already have a value", () => {
    const { env, skipped } = applyDefaults11(base, defaults);
    expect(env.B).toBe("2");
    expect(skipped).toContain("B");
  });

  it("does not overwrite empty values by default", () => {
    const { env, skipped } = applyDefaults11({ X: "" }, { X: "fallback" });
    expect(env.X).toBe("");
    expect(skipped).toContain("X");
  });

  it("overwrites empty values when overwriteEmpty is true", () => {
    const { env, applied } = applyDefaults11(
      { X: "" },
      { X: "fallback" },
      true
    );
    expect(env.X).toBe("fallback");
    expect(applied).toContain("X");
  });

  it("returns original env unchanged when defaults is empty", () => {
    const { env, applied, skipped } = applyDefaults11(base, {});
    expect(env).toEqual(base);
    expect(applied).toHaveLength(0);
    expect(skipped).toHaveLength(0);
  });
});

describe("getMissingDefaults11", () => {
  it("returns keys present in defaults but not in env", () => {
    const missing = getMissingDefaults11({ A: "1" }, { A: "x", B: "y", C: "z" });
    expect(missing).toEqual(["B", "C"]);
  });

  it("returns empty array when all defaults are present", () => {
    expect(getMissingDefaults11({ A: "1", B: "2" }, { A: "x", B: "y" })).toEqual([]);
  });
});

describe("formatDefaults11Result", () => {
  it("formats applied and skipped keys", () => {
    const output = formatDefaults11Result({
      env: {},
      applied: ["C", "D"],
      skipped: ["B"],
    });
    expect(output).toContain("Applied defaults for: C, D");
    expect(output).toContain("Skipped (already set): B");
  });

  it("shows a neutral message when nothing changed", () => {
    const output = formatDefaults11Result({ env: {}, applied: [], skipped: [] });
    expect(output).toBe("No defaults to apply.");
  });
});
