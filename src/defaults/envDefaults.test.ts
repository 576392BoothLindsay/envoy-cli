import { applyDefaults, getMissingDefaults, formatDefaultsResult } from "./envDefaults";

describe("applyDefaults", () => {
  it("applies defaults for missing keys", () => {
    const target = { A: "1" };
    const defaults = { A: "10", B: "20" };
    const result = applyDefaults(target, defaults);
    expect(result.merged.A).toBe("1");
    expect(result.merged.B).toBe("20");
    expect(result.applied).toEqual({ B: "20" });
    expect(result.skipped).toEqual({ A: "1" });
  });

  it("overwrites empty values when overwriteEmpty is true", () => {
    const target = { A: "", B: "hello" };
    const defaults = { A: "default_a", B: "default_b" };
    const result = applyDefaults(target, defaults, true);
    expect(result.merged.A).toBe("default_a");
    expect(result.merged.B).toBe("hello");
  });

  it("does not overwrite empty values when overwriteEmpty is false", () => {
    const target = { A: "" };
    const defaults = { A: "default_a" };
    const result = applyDefaults(target, defaults, false);
    expect(result.merged.A).toBe("");
    expect(result.skipped).toEqual({ A: "" });
  });

  it("returns empty applied/skipped when defaults is empty", () => {
    const result = applyDefaults({ A: "1" }, {});
    expect(result.applied).toEqual({});
    expect(result.skipped).toEqual({});
    expect(result.merged).toEqual({ A: "1" });
  });
});

describe("getMissingDefaults", () => {
  it("returns keys missing from env", () => {
    const missing = getMissingDefaults({ A: "1" }, { A: "x", B: "y", C: "z" });
    expect(missing).toContain("B");
    expect(missing).toContain("C");
    expect(missing).not.toContain("A");
  });

  it("includes keys with empty values", () => {
    const missing = getMissingDefaults({ A: "" }, { A: "val" });
    expect(missing).toContain("A");
  });
});

describe("formatDefaultsResult", () => {
  it("returns message when nothing to apply", () => {
    const result = formatDefaultsResult({ applied: {}, skipped: {}, merged: {} });
    expect(result).toBe("No defaults to apply.");
  });

  it("shows applied and skipped keys", () => {
    const result = formatDefaultsResult({
      applied: { B: "20" },
      skipped: { A: "1" },
      merged: { A: "1", B: "20" },
    });
    expect(result).toContain("+ B=20");
    expect(result).toContain("~ A");
  });
});
