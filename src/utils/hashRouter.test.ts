import { afterEach, describe, expect, it } from "vitest";
import {
  DEFAULT_VIEW,
  parseHash,
  setHash,
  viewToHash,
} from "./hashRouter";

afterEach(() => {
  window.location.hash = "";
});

describe("parseHash", () => {
  it("parses '#/spending' as 'spending'", () => {
    expect(parseHash("#/spending")).toBe("spending");
  });

  it("parses 'spending' without the #/ prefix", () => {
    expect(parseHash("spending")).toBe("spending");
  });

  it("falls back to the default view for empty input", () => {
    expect(parseHash("")).toBe(DEFAULT_VIEW);
  });

  it("falls back to the default view for unknown ids", () => {
    expect(parseHash("#/does-not-exist")).toBe(DEFAULT_VIEW);
  });

  it("ignores a trailing slash", () => {
    expect(parseHash("#/patterns/")).toBe("patterns");
  });
});

describe("viewToHash", () => {
  it("returns '#/<view>' form", () => {
    expect(viewToHash("spending")).toBe("#/spending");
  });
});

describe("setHash", () => {
  it("updates window.location.hash", () => {
    setHash("patterns");
    expect(window.location.hash).toBe("#/patterns");
  });
});
