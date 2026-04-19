import { describe, expect, it } from "vitest";
import {
  dayOfWeekLabelsDE,
  getDayOfWeek,
  getHourOfDay,
  getISOWeekKey,
  getMonthKey,
  groupByMonth,
  groupByYear,
} from "./dateUtils";
import { createOrderItem } from "../../test/fixtures/sampleOrders";

describe("getDayOfWeek (Europe/Berlin, ISO: Monday=0 … Sunday=6)", () => {
  it("returns 0 for Monday", () => {
    // 2024-10-21 was a Monday
    expect(getDayOfWeek(new Date("2024-10-21T12:00:00Z"))).toBe(0);
  });

  it("returns 6 for Sunday", () => {
    // 2024-10-27 was a Sunday
    expect(getDayOfWeek(new Date("2024-10-27T12:00:00Z"))).toBe(6);
  });

  it("respects Berlin timezone at day boundary", () => {
    // 2024-01-15 23:30 UTC is 2024-01-16 00:30 Berlin (CET = UTC+1)
    // So Monday UTC becomes Tuesday Berlin
    expect(getDayOfWeek(new Date("2024-01-15T23:30:00Z"))).toBe(1);
  });
});

describe("getHourOfDay (Europe/Berlin)", () => {
  it("extracts hour in Berlin time during winter (CET = UTC+1)", () => {
    expect(getHourOfDay(new Date("2024-01-15T10:00:00Z"))).toBe(11);
  });

  it("extracts hour in Berlin time during summer (CEST = UTC+2)", () => {
    expect(getHourOfDay(new Date("2024-07-15T10:00:00Z"))).toBe(12);
  });

  it("wraps midnight correctly", () => {
    // 23:30 UTC winter = 00:30 Berlin next day
    expect(getHourOfDay(new Date("2024-01-15T23:30:00Z"))).toBe(0);
  });

  it("returns hour in 0-23 range for end of day", () => {
    expect(getHourOfDay(new Date("2024-01-15T22:59:00Z"))).toBe(23);
  });
});

describe("getMonthKey", () => {
  it("returns YYYY-MM format in Berlin timezone", () => {
    expect(getMonthKey(new Date("2024-10-21T12:00:00Z"))).toBe("2024-10");
  });

  it("pads single-digit months", () => {
    expect(getMonthKey(new Date("2024-03-15T12:00:00Z"))).toBe("2024-03");
  });

  it("uses Berlin time at year boundary — Dec 31 23:30 UTC is Jan 1 Berlin", () => {
    // Dec 31 23:30 UTC = Jan 1 00:30 Berlin (CET winter)
    expect(getMonthKey(new Date("2024-12-31T23:30:00Z"))).toBe("2025-01");
  });
});

describe("groupByMonth", () => {
  it("groups OrderItems by Berlin month key", () => {
    const items = [
      createOrderItem({ orderDate: new Date("2024-10-15T10:00:00Z") }),
      createOrderItem({ orderDate: new Date("2024-10-25T10:00:00Z") }),
      createOrderItem({ orderDate: new Date("2024-11-05T10:00:00Z") }),
    ];
    const groups = groupByMonth(items);
    expect(groups.get("2024-10")?.length).toBe(2);
    expect(groups.get("2024-11")?.length).toBe(1);
  });

  it("returns empty Map for empty input", () => {
    expect(groupByMonth([]).size).toBe(0);
  });

  it("handles items spanning year boundary", () => {
    const items = [
      createOrderItem({ orderDate: new Date("2024-12-20T10:00:00Z") }),
      createOrderItem({ orderDate: new Date("2025-01-05T10:00:00Z") }),
    ];
    const groups = groupByMonth(items);
    expect(groups.get("2024-12")?.length).toBe(1);
    expect(groups.get("2025-01")?.length).toBe(1);
  });
});

describe("groupByYear", () => {
  it("groups OrderItems by Berlin year", () => {
    const items = [
      createOrderItem({ orderDate: new Date("2022-06-15T10:00:00Z") }),
      createOrderItem({ orderDate: new Date("2023-06-15T10:00:00Z") }),
      createOrderItem({ orderDate: new Date("2023-12-10T10:00:00Z") }),
    ];
    const groups = groupByYear(items);
    expect(groups.get(2022)?.length).toBe(1);
    expect(groups.get(2023)?.length).toBe(2);
  });

  it("returns empty Map for empty input", () => {
    expect(groupByYear([]).size).toBe(0);
  });

  it("shifts items at year boundary to Berlin year", () => {
    // Dec 31 23:30 UTC 2024 = Jan 1 Berlin 2025
    const items = [createOrderItem({ orderDate: new Date("2024-12-31T23:30:00Z") })];
    const groups = groupByYear(items);
    expect(groups.get(2025)?.length).toBe(1);
    expect(groups.has(2024)).toBe(false);
  });
});

describe("getISOWeekKey (Europe/Berlin, ISO 8601)", () => {
  it("returns YYYY-Www format", () => {
    // 2024-11-29 (Black Friday) is a Friday, ISO week 48
    expect(getISOWeekKey(new Date("2024-11-29T12:00:00Z"))).toBe("2024-W48");
  });

  it("uses ISO week-numbering year at year boundary (Dec days that belong to next year's W01)", () => {
    // 2024-12-30 is Monday; the Thursday of that ISO week is 2025-01-02 → ISO year 2025, week 1
    expect(getISOWeekKey(new Date("2024-12-30T12:00:00Z"))).toBe("2025-W01");
  });

  it("uses ISO week-numbering year at year boundary (early Jan days that belong to previous year)", () => {
    // 2023-01-01 is Sunday; ISO week is 2022-W52
    expect(getISOWeekKey(new Date("2023-01-01T12:00:00Z"))).toBe("2022-W52");
  });

  it("zero-pads single-digit week numbers", () => {
    // 2024-01-08 is Monday of ISO week 2
    expect(getISOWeekKey(new Date("2024-01-08T12:00:00Z"))).toBe("2024-W02");
  });

  it("respects Berlin timezone at day boundary", () => {
    // 2024-01-07 23:30 UTC = 2024-01-08 00:30 Berlin → ISO week 2 of 2024
    expect(getISOWeekKey(new Date("2024-01-07T23:30:00Z"))).toBe("2024-W02");
  });
});

describe("dayOfWeekLabelsDE", () => {
  it("exports 7 German weekday labels starting with Monday", () => {
    expect(dayOfWeekLabelsDE).toHaveLength(7);
    expect(dayOfWeekLabelsDE[0]).toBe("Mo");
    expect(dayOfWeekLabelsDE[6]).toBe("So");
  });
});
