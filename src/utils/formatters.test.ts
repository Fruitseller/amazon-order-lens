import { describe, expect, it } from "vitest";
import {
  formatDate,
  formatEuro,
  formatMonthKey,
  formatNumber,
  formatPercent,
  formatWeekKey,
} from "./formatters";

describe("formatEuro", () => {
  it("keeps the amount and currency symbol together with a non-breaking space", () => {
    expect(formatEuro(1234.5)).toContain("\u00A0€");
  });

  it("formats positive decimal numbers with German locale", () => {
    expect(formatEuro(1234.5)).toBe("1.234,50\u00A0€");
  });

  it("formats zero", () => {
    expect(formatEuro(0)).toBe("0,00\u00A0€");
  });

  it("formats negative numbers", () => {
    expect(formatEuro(-15.99)).toBe("-15,99\u00A0€");
  });

  it("formats large numbers with thousands separator", () => {
    expect(formatEuro(1_234_567.89)).toBe("1.234.567,89\u00A0€");
  });

  it("rounds half to even / standard rounding at 2 decimals", () => {
    expect(formatEuro(9.999)).toBe("10,00\u00A0€");
  });

  it("handles very small fractions", () => {
    expect(formatEuro(0.004)).toBe("0,00\u00A0€");
  });
});

describe("formatDate", () => {
  it("formats Date as DD.MM.YYYY", () => {
    expect(formatDate(new Date("2024-10-21T12:00:00Z"))).toBe("21.10.2024");
  });

  it("pads single-digit day and month", () => {
    expect(formatDate(new Date("2024-01-05T12:00:00Z"))).toBe("05.01.2024");
  });

  it("returns a placeholder for null", () => {
    expect(formatDate(null)).toBe("—");
  });
});

describe("formatPercent", () => {
  it("formats decimal fraction as German percent with one decimal place", () => {
    expect(formatPercent(0.156)).toBe("15,6 %");
  });

  it("formats zero", () => {
    expect(formatPercent(0)).toBe("0,0 %");
  });

  it("formats 100%", () => {
    expect(formatPercent(1)).toBe("100,0 %");
  });
});

describe("formatNumber", () => {
  it("formats integer with German thousands separator", () => {
    expect(formatNumber(1234)).toBe("1.234");
  });

  it("formats zero", () => {
    expect(formatNumber(0)).toBe("0");
  });

  it("handles decimals with configurable precision", () => {
    expect(formatNumber(12.5, 1)).toBe("12,5");
  });
});

describe("formatMonthKey", () => {
  it("renders YYYY-MM as German month name + year", () => {
    expect(formatMonthKey("2024-11")).toBe("November 2024");
  });

  it("returns the input unchanged for malformed keys", () => {
    expect(formatMonthKey("nope")).toBe("nope");
  });
});

describe("formatWeekKey", () => {
  it("renders YYYY-Www as 'KW ww / YYYY'", () => {
    expect(formatWeekKey("2024-W48")).toBe("KW 48 / 2024");
  });

  it("returns the input unchanged for malformed keys", () => {
    expect(formatWeekKey("2024-48")).toBe("2024-48");
  });
});
