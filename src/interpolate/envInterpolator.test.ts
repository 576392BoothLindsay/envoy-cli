import {
  interpolateValue,
  interpolateEnv,
  getReferencedKeys,
  getUnresolvedKeys,
} from "./envInterpolator";

describe("interpolateValue", () => {
  it("replaces a known variable reference", () => {
    const env = { HOST: "localhost" };
    expect(interpolateValue("http://${HOST}/api", env)).toBe(
      "http://localhost/api"
    );
  });

  it("leaves unknown references unchanged", () => {
    const env = {};
    expect(interpolateValue("${UNKNOWN}", env)).toBe("${UNKNOWN}");
  });

  it("replaces multiple references in one value", () => {
    const env = { HOST: "example.com", PORT: "8080" };
    expect(interpolateValue("${HOST}:${PORT}", env)).toBe("example.com:8080");
  });

  it("returns plain values unchanged", () => {
    expect(interpolateValue("plainvalue", {})).toBe("plainvalue");
  });
});

describe("interpolateEnv", () => {
  it("interpolates all values in the record", () => {
    const env = { HOST: "localhost", PORT: "3000", URL: "http://${HOST}:${PORT}" };
    const result = interpolateEnv(env);
    expect(result.URL).toBe("http://localhost:3000");
    expect(result.HOST).toBe("localhost");
    expect(result.PORT).toBe("3000");
  });

  it("does not mutate the original record", () => {
    const env = { A: "${B}", B: "hello" };
    interpolateEnv(env);
    expect(env.A).toBe("${B}");
  });
});

describe("getReferencedKeys", () => {
  it("extracts referenced variable names", () => {
    expect(getReferencedKeys("${HOST}:${PORT}")).toEqual(["HOST", "PORT"]);
  });

  it("returns empty array for plain values", () => {
    expect(getReferencedKeys("no-references")).toEqual([]);
  });

  it("handles duplicate references", () => {
    expect(getReferencedKeys("${A}/${A}")).toEqual(["A", "A"]);
  });
});

describe("getUnresolvedKeys", () => {
  it("returns keys with unresolved references", () => {
    const env = { URL: "http://${MISSING_HOST}" };
    expect(getUnresolvedKeys(env)).toEqual(["URL"]);
  });

  it("returns empty array when all references resolve", () => {
    const env = { HOST: "localhost", URL: "http://${HOST}" };
    expect(getUnresolvedKeys(env)).toEqual([]);
  });

  it("returns empty array for env with no interpolation", () => {
    const env = { KEY: "value", OTHER: "plain" };
    expect(getUnresolvedKeys(env)).toEqual([]);
  });
});
