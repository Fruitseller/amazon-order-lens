import { describe, expect, it } from "vitest";
import {
  calculateAverageOrderValue,
  calculateAverageRefund,
  calculateCarrierDistribution,
  calculateDayOfWeekDistribution,
  calculateFulfillmentSpeed,
  calculateHourDistribution,
  calculateInvestmentOpportunityCost,
  calculatePrimeSavingsEstimate,
  calculateRefundReasonDistribution,
  calculateRefundsByMonth,
  calculateReturnsByCategory,
  calculateShoppingEventStats,
  calculateSpendingByCategory,
  calculateSpendingByMonth,
  calculateSpendingByYear,
  calculateTotalRefunded,
  calculateTotalSpending,
  findBusiestDay,
  findLongestGap,
  findRecordMonth,
  findRecordWeek,
  findRepeatPurchases,
  findTopItems,
  findTopReturnedProducts,
} from "./statistics";
import {
  createOrderAggregate,
  createOrderItem,
  createReturnRecord,
} from "../../test/fixtures/sampleOrders";
import type { ReturnRequest } from "../types/order";
import { aggregateOrders } from "./aggregator";

describe("calculateTotalSpending", () => {
  it("sums totalOwed across items", () => {
    const items = [
      createOrderItem({ totalOwed: 10.5 }),
      createOrderItem({ totalOwed: 20.25 }),
      createOrderItem({ totalOwed: 5.0 }),
    ];
    expect(calculateTotalSpending(items)).toBeCloseTo(35.75, 2);
  });

  it("returns 0 for empty array", () => {
    expect(calculateTotalSpending([])).toBe(0);
  });
});

describe("calculateAverageOrderValue", () => {
  it("returns total / count", () => {
    const orders = [
      createOrderAggregate({ orderId: "O-1", totalOwed: 10, items: [createOrderItem({ orderId: "O-1", totalOwed: 10 })] }),
      createOrderAggregate({ orderId: "O-2", totalOwed: 20, items: [createOrderItem({ orderId: "O-2", totalOwed: 20 })] }),
      createOrderAggregate({ orderId: "O-3", totalOwed: 30, items: [createOrderItem({ orderId: "O-3", totalOwed: 30 })] }),
    ];
    expect(calculateAverageOrderValue(orders)).toBeCloseTo(20, 2);
  });

  it("returns 0 for empty array", () => {
    expect(calculateAverageOrderValue([])).toBe(0);
  });
});

describe("calculateSpendingByMonth", () => {
  it("groups totalOwed by YYYY-MM Berlin key", () => {
    const items = [
      createOrderItem({ orderDate: new Date("2024-10-15T10:00:00Z"), totalOwed: 10 }),
      createOrderItem({ orderDate: new Date("2024-10-20T10:00:00Z"), totalOwed: 20 }),
      createOrderItem({ orderDate: new Date("2024-11-05T10:00:00Z"), totalOwed: 15 }),
    ];
    const result = calculateSpendingByMonth(items);
    expect(result.get("2024-10")).toBeCloseTo(30, 2);
    expect(result.get("2024-11")).toBeCloseTo(15, 2);
  });

  it("returns empty map for empty input", () => {
    expect(calculateSpendingByMonth([]).size).toBe(0);
  });
});

describe("calculateSpendingByYear", () => {
  it("groups totalOwed by Berlin year", () => {
    const items = [
      createOrderItem({ orderDate: new Date("2022-06-01T10:00:00Z"), totalOwed: 100 }),
      createOrderItem({ orderDate: new Date("2023-06-01T10:00:00Z"), totalOwed: 200 }),
      createOrderItem({ orderDate: new Date("2023-12-01T10:00:00Z"), totalOwed: 50 }),
    ];
    const result = calculateSpendingByYear(items);
    expect(result.get(2022)).toBeCloseTo(100, 2);
    expect(result.get(2023)).toBeCloseTo(250, 2);
  });

  it("returns empty map for empty input", () => {
    expect(calculateSpendingByYear([]).size).toBe(0);
  });
});

describe("calculateSpendingByCategory", () => {
  it("sums totalOwed per inferred category", () => {
    const items = [
      createOrderItem({ inferredCategory: "elektronik", totalOwed: 10 }),
      createOrderItem({ inferredCategory: "elektronik", totalOwed: 20 }),
      createOrderItem({ inferredCategory: "buecher", totalOwed: 15 }),
    ];
    const result = calculateSpendingByCategory(items);
    expect(result.get("elektronik")).toBeCloseTo(30, 2);
    expect(result.get("buecher")).toBeCloseTo(15, 2);
  });

  it("returns empty map for empty input", () => {
    expect(calculateSpendingByCategory([]).size).toBe(0);
  });
});

describe("calculateDayOfWeekDistribution", () => {
  it("returns length-7 array with ISO weekday counts (0=Mo, 6=So)", () => {
    const items = [
      createOrderItem({ orderDate: new Date("2024-10-21T12:00:00Z") }), // Mo
      createOrderItem({ orderDate: new Date("2024-10-21T18:00:00Z") }), // Mo
      createOrderItem({ orderDate: new Date("2024-10-26T12:00:00Z") }), // Sa
      createOrderItem({ orderDate: new Date("2024-10-27T12:00:00Z") }), // So
    ];
    const dist = calculateDayOfWeekDistribution(items);
    expect(dist).toHaveLength(7);
    expect(dist[0]).toBe(2);
    expect(dist[5]).toBe(1);
    expect(dist[6]).toBe(1);
  });

  it("returns [0,0,0,0,0,0,0] for empty input", () => {
    expect(calculateDayOfWeekDistribution([])).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });
});

describe("calculateHourDistribution", () => {
  it("returns length-24 array with Berlin hour counts", () => {
    const items = [
      createOrderItem({ orderDate: new Date("2024-01-15T10:00:00Z") }), // 11 Berlin
      createOrderItem({ orderDate: new Date("2024-01-15T22:30:00Z") }), // 23 Berlin
    ];
    const dist = calculateHourDistribution(items);
    expect(dist).toHaveLength(24);
    expect(dist[11]).toBe(1);
    expect(dist[23]).toBe(1);
    expect(dist[0]).toBe(0);
  });

  it("returns all-zero length-24 for empty input", () => {
    expect(calculateHourDistribution([])).toEqual(Array(24).fill(0));
  });
});

describe("findTopItems", () => {
  it("returns items grouped by ASIN sorted by total quantity desc, limited to n", () => {
    const items = [
      createOrderItem({ asin: "A", productName: "Item A", quantity: 1, totalOwed: 10 }),
      createOrderItem({ asin: "A", productName: "Item A", quantity: 1, totalOwed: 10 }),
      createOrderItem({ asin: "A", productName: "Item A", quantity: 2, totalOwed: 20 }),
      createOrderItem({ asin: "B", productName: "Item B", quantity: 3, totalOwed: 30 }),
      createOrderItem({ asin: "C", productName: "Item C", quantity: 1, totalOwed: 5 }),
    ];
    const top = findTopItems(items, 2);
    expect(top).toHaveLength(2);
    expect(top[0]?.asin).toBe("A");
    expect(top[0]?.quantity).toBe(4);
    expect(top[0]?.occurrences).toBe(3);
    expect(top[0]?.totalSpent).toBeCloseTo(40, 2);
    expect(top[1]?.asin).toBe("B");
  });

  it("returns empty array for empty input", () => {
    expect(findTopItems([], 5)).toEqual([]);
  });
});

describe("findRepeatPurchases", () => {
  it("returns items bought at least minCount times", () => {
    const items = [
      createOrderItem({ asin: "A", productName: "A" }),
      createOrderItem({ asin: "A", productName: "A" }),
      createOrderItem({ asin: "A", productName: "A" }),
      createOrderItem({ asin: "B", productName: "B" }),
      createOrderItem({ asin: "B", productName: "B" }),
    ];
    const repeat = findRepeatPurchases(items, 3);
    expect(repeat).toHaveLength(1);
    expect(repeat[0]?.asin).toBe("A");
    expect(repeat[0]?.count).toBe(3);
  });

  it("calculates average interval in days between purchases", () => {
    const items = [
      createOrderItem({ asin: "A", orderDate: new Date("2024-01-01T10:00:00Z") }),
      createOrderItem({ asin: "A", orderDate: new Date("2024-02-01T10:00:00Z") }),
      createOrderItem({ asin: "A", orderDate: new Date("2024-03-01T10:00:00Z") }),
    ];
    const repeat = findRepeatPurchases(items, 3);
    expect(repeat[0]?.averageIntervalDays).toBeGreaterThan(29);
    expect(repeat[0]?.averageIntervalDays).toBeLessThan(32);
  });

  it("returns empty array for items below threshold", () => {
    const items = [createOrderItem({ asin: "A" }), createOrderItem({ asin: "A" })];
    expect(findRepeatPurchases(items, 3)).toEqual([]);
  });
});

describe("calculateInvestmentOpportunityCost", () => {
  it("computes compound growth per item from orderDate to asOf", () => {
    const asOf = new Date("2030-01-01T00:00:00Z");
    // 100 EUR from 2020-01-01 at 10% over exactly 10 years = 100 * 1.1^10 ≈ 259.37
    const items = [
      createOrderItem({
        orderDate: new Date("2020-01-01T00:00:00Z"),
        totalOwed: 100,
      }),
    ];
    const result = calculateInvestmentOpportunityCost(items, 0.1, asOf);
    expect(result).toBeGreaterThan(258);
    expect(result).toBeLessThan(261);
  });

  it("returns 0 for empty input", () => {
    expect(calculateInvestmentOpportunityCost([], 0.08)).toBe(0);
  });

  it("ignores items in the future (years < 0)", () => {
    const asOf = new Date("2020-01-01T00:00:00Z");
    const items = [
      createOrderItem({ orderDate: new Date("2030-01-01T00:00:00Z"), totalOwed: 100 }),
    ];
    const result = calculateInvestmentOpportunityCost(items, 0.08, asOf);
    expect(result).toBe(0);
  });
});

describe("calculatePrimeSavingsEstimate", () => {
  it("multiplies free-shipping order count by standardShippingCost", () => {
    const orders = [
      createOrderAggregate({
        orderId: "O-1",
        shippingCharge: 0,
        items: [createOrderItem({ orderId: "O-1", shippingCharge: 0 })],
      }),
      createOrderAggregate({
        orderId: "O-2",
        shippingCharge: 0,
        items: [createOrderItem({ orderId: "O-2", shippingCharge: 0 })],
      }),
      createOrderAggregate({
        orderId: "O-3",
        shippingCharge: 3.99,
        items: [createOrderItem({ orderId: "O-3", shippingCharge: 3.99 })],
      }),
    ];
    expect(calculatePrimeSavingsEstimate(orders, 3.99)).toBeCloseTo(7.98, 2);
  });

  it("returns 0 for empty input", () => {
    expect(calculatePrimeSavingsEstimate([], 3.99)).toBe(0);
  });
});

describe("findLongestGap", () => {
  it("returns the longest interval between consecutive orders", () => {
    const items = [
      createOrderItem({ orderId: "O-1", orderDate: new Date("2024-01-01T10:00:00Z") }),
      createOrderItem({ orderId: "O-2", orderDate: new Date("2024-01-15T10:00:00Z") }),
      createOrderItem({ orderId: "O-3", orderDate: new Date("2024-06-01T10:00:00Z") }),
      createOrderItem({ orderId: "O-4", orderDate: new Date("2024-06-10T10:00:00Z") }),
    ];
    const orders = aggregateOrders(items);
    const gap = findLongestGap(orders);
    expect(gap).not.toBeNull();
    expect(gap?.from.toISOString()).toBe("2024-01-15T10:00:00.000Z");
    expect(gap?.to.toISOString()).toBe("2024-06-01T10:00:00.000Z");
    expect(gap?.days).toBeGreaterThan(130);
  });

  it("returns null for fewer than 2 orders", () => {
    const orders = [createOrderAggregate({ orderId: "O-1" })];
    expect(findLongestGap(orders)).toBeNull();
    expect(findLongestGap([])).toBeNull();
  });
});

describe("findBusiestDay", () => {
  it("returns the Berlin date with the most orders", () => {
    const items = [
      createOrderItem({ orderId: "O-1", orderDate: new Date("2024-10-21T08:00:00Z") }),
      createOrderItem({ orderId: "O-2", orderDate: new Date("2024-10-21T12:00:00Z") }),
      createOrderItem({ orderId: "O-3", orderDate: new Date("2024-10-21T18:00:00Z") }),
      createOrderItem({ orderId: "O-4", orderDate: new Date("2024-10-22T08:00:00Z") }),
    ];
    const orders = aggregateOrders(items);
    const busy = findBusiestDay(orders);
    expect(busy?.date).toBe("2024-10-21");
    expect(busy?.count).toBe(3);
  });

  it("returns null for empty input", () => {
    expect(findBusiestDay([])).toBeNull();
  });
});

describe("calculateFulfillmentSpeed", () => {
  it("computes average fulfillmentDays over items with non-null values", () => {
    const items = [
      createOrderItem({ fulfillmentDays: 1 }),
      createOrderItem({ fulfillmentDays: 2 }),
      createOrderItem({ fulfillmentDays: 3 }),
      createOrderItem({ fulfillmentDays: null }),
    ];
    expect(calculateFulfillmentSpeed(items)).toBeCloseTo(2, 2);
  });

  it("returns null when no items have fulfillmentDays", () => {
    const items = [createOrderItem({ fulfillmentDays: null })];
    expect(calculateFulfillmentSpeed(items)).toBeNull();
  });

  it("returns null for empty input", () => {
    expect(calculateFulfillmentSpeed([])).toBeNull();
  });
});

describe("calculateShoppingEventStats", () => {
  function entryFor(
    stats: ReturnType<typeof calculateShoppingEventStats>,
    name: string,
  ) {
    const found = stats.find((e) => e.event === name);
    if (!found) throw new Error(`Event ${name} not found in stats`);
    return found;
  }

  it("returns one entry per known event even with empty input", () => {
    const stats = calculateShoppingEventStats([], []);
    const names = stats.map((e) => e.event).sort();
    expect(names).toEqual(["Black Friday", "Cyber Monday", "Prime Day", "Weihnachten"]);
    for (const e of stats) {
      expect(e.totalSpending).toBe(0);
      expect(e.orderCount).toBe(0);
      expect(e.itemCount).toBe(0);
    }
  });

  it("attributes items on Black Friday 2024 (2024-11-29)", () => {
    const items = [
      createOrderItem({
        orderId: "BF-1",
        orderDate: new Date("2024-11-29T10:00:00Z"),
        totalOwed: 99,
        quantity: 2,
      }),
    ];
    const orders = aggregateOrders(items);
    const stats = calculateShoppingEventStats(items, orders);
    const bf = entryFor(stats, "Black Friday");
    expect(bf.totalSpending).toBeCloseTo(99, 2);
    expect(bf.orderCount).toBe(1);
    expect(bf.itemCount).toBe(2);
    expect(entryFor(stats, "Cyber Monday").orderCount).toBe(0);
  });

  it("attributes items on Cyber Monday 2024 (2024-12-02) and counts them under Weihnachten too", () => {
    const items = [
      createOrderItem({
        orderId: "CM-1",
        orderDate: new Date("2024-12-02T08:00:00Z"),
        totalOwed: 50,
      }),
    ];
    const orders = aggregateOrders(items);
    const stats = calculateShoppingEventStats(items, orders);
    expect(entryFor(stats, "Cyber Monday").orderCount).toBe(1);
    expect(entryFor(stats, "Weihnachten").orderCount).toBe(1);
  });

  it("attributes items on Prime Day 2024 (2024-07-16/17)", () => {
    const items = [
      createOrderItem({
        orderId: "PD-1",
        orderDate: new Date("2024-07-16T09:00:00Z"),
        totalOwed: 30,
      }),
      createOrderItem({
        orderId: "PD-2",
        orderDate: new Date("2024-07-17T09:00:00Z"),
        totalOwed: 20,
      }),
    ];
    const orders = aggregateOrders(items);
    const stats = calculateShoppingEventStats(items, orders);
    const pd = entryFor(stats, "Prime Day");
    expect(pd.totalSpending).toBeCloseTo(50, 2);
    expect(pd.orderCount).toBe(2);
  });

  it("attributes items in the Weihnachten window (Dec 1–24)", () => {
    const items = [
      createOrderItem({
        orderId: "X-1",
        orderDate: new Date("2024-12-15T12:00:00Z"),
        totalOwed: 40,
      }),
      createOrderItem({
        orderId: "X-2",
        orderDate: new Date("2024-12-25T12:00:00Z"),
        totalOwed: 999,
      }),
    ];
    const orders = aggregateOrders(items);
    const stats = calculateShoppingEventStats(items, orders);
    const x = entryFor(stats, "Weihnachten");
    expect(x.orderCount).toBe(1);
    expect(x.totalSpending).toBeCloseTo(40, 2);
  });

  it("ignores items outside any event window", () => {
    const items = [
      createOrderItem({
        orderId: "N-1",
        orderDate: new Date("2024-01-15T12:00:00Z"),
        totalOwed: 100,
      }),
    ];
    const orders = aggregateOrders(items);
    const stats = calculateShoppingEventStats(items, orders);
    for (const e of stats) {
      expect(e.totalSpending).toBe(0);
      expect(e.orderCount).toBe(0);
    }
  });

  it("aggregates across multiple years (Black Friday 2023 = 2023-11-24, 2024 = 2024-11-29)", () => {
    const items = [
      createOrderItem({
        orderId: "BF23",
        orderDate: new Date("2023-11-24T10:00:00Z"),
        totalOwed: 10,
      }),
      createOrderItem({
        orderId: "BF24",
        orderDate: new Date("2024-11-29T10:00:00Z"),
        totalOwed: 20,
      }),
    ];
    const orders = aggregateOrders(items);
    const stats = calculateShoppingEventStats(items, orders);
    const bf = entryFor(stats, "Black Friday");
    expect(bf.orderCount).toBe(2);
    expect(bf.totalSpending).toBeCloseTo(30, 2);
  });
});

describe("findRecordMonth", () => {
  it("returns the YYYY-MM with highest spending and includes order/item counts", () => {
    const items = [
      // Oct 2024: 30 EUR / 2 orders / 3 items
      createOrderItem({ orderId: "O-1", orderDate: new Date("2024-10-05T10:00:00Z"), totalOwed: 10, quantity: 1 }),
      createOrderItem({ orderId: "O-2", orderDate: new Date("2024-10-15T10:00:00Z"), totalOwed: 20, quantity: 2 }),
      // Nov 2024: 100 EUR / 1 order
      createOrderItem({ orderId: "O-3", orderDate: new Date("2024-11-05T10:00:00Z"), totalOwed: 100, quantity: 1 }),
    ];
    const orders = aggregateOrders(items);
    const rec = findRecordMonth(items, orders);
    expect(rec?.key).toBe("2024-11");
    expect(rec?.spending).toBeCloseTo(100, 2);
    expect(rec?.orderCount).toBe(1);
  });

  it("returns null for empty input", () => {
    expect(findRecordMonth([], [])).toBeNull();
  });
});

describe("findRecordWeek", () => {
  it("returns the ISO week with highest spending and includes order count", () => {
    const items = [
      // Week 2024-W48 (Mon 2024-11-25 .. Sun 2024-12-01): Black Friday week
      createOrderItem({ orderId: "W-1", orderDate: new Date("2024-11-29T10:00:00Z"), totalOwed: 200 }),
      // Week 2024-W43
      createOrderItem({ orderId: "W-2", orderDate: new Date("2024-10-21T10:00:00Z"), totalOwed: 50 }),
    ];
    const orders = aggregateOrders(items);
    const rec = findRecordWeek(items, orders);
    expect(rec?.key).toBe("2024-W48");
    expect(rec?.spending).toBeCloseTo(200, 2);
    expect(rec?.orderCount).toBe(1);
  });

  it("returns null for empty input", () => {
    expect(findRecordWeek([], [])).toBeNull();
  });
});

describe("calculateTotalRefunded", () => {
  it("sums refundAmount across return records", () => {
    const returns = [
      createReturnRecord({ refundAmount: 10 }),
      createReturnRecord({ refundAmount: 25.5 }),
      createReturnRecord({ refundAmount: 4.5 }),
    ];
    expect(calculateTotalRefunded(returns)).toBeCloseTo(40, 2);
  });
  it("returns 0 for empty input", () => {
    expect(calculateTotalRefunded([])).toBe(0);
  });
});

describe("calculateAverageRefund", () => {
  it("returns total / count", () => {
    const returns = [
      createReturnRecord({ refundAmount: 10 }),
      createReturnRecord({ refundAmount: 20 }),
      createReturnRecord({ refundAmount: 30 }),
    ];
    expect(calculateAverageRefund(returns)).toBeCloseTo(20, 2);
  });
  it("returns 0 for empty input", () => {
    expect(calculateAverageRefund([])).toBe(0);
  });
});

describe("calculateRefundsByMonth", () => {
  it("groups refundAmount by Berlin YYYY-MM key", () => {
    const returns = [
      createReturnRecord({ returnDate: new Date("2024-10-15T10:00:00Z"), refundAmount: 10 }),
      createReturnRecord({ returnDate: new Date("2024-10-25T10:00:00Z"), refundAmount: 5 }),
      createReturnRecord({ returnDate: new Date("2024-11-01T10:00:00Z"), refundAmount: 30 }),
    ];
    const result = calculateRefundsByMonth(returns);
    expect(result.get("2024-10")).toBeCloseTo(15, 2);
    expect(result.get("2024-11")).toBeCloseTo(30, 2);
  });
  it("returns empty Map for empty input", () => {
    expect(calculateRefundsByMonth([]).size).toBe(0);
  });
});

describe("calculateRefundReasonDistribution", () => {
  it("counts refunds per reason, falls back to 'Unbekannt' for empty", () => {
    const returns = [
      createReturnRecord({ reason: "Customer return" }),
      createReturnRecord({ reason: "Customer return" }),
      createReturnRecord({ reason: "Defective" }),
      createReturnRecord({ reason: "" }),
    ];
    const dist = calculateRefundReasonDistribution(returns);
    expect(dist.get("Customer return")).toBe(2);
    expect(dist.get("Defective")).toBe(1);
    expect(dist.get("Unbekannt")).toBe(1);
  });
});

describe("findTopReturnedProducts", () => {
  function req(asin: string, productName: string, reasonCode = "CR-X"): ReturnRequest {
    return { orderId: "O", asin, productName, reasonCode };
  }
  it("returns top-N products by request count", () => {
    const requests = [
      req("A", "Item A"),
      req("A", "Item A"),
      req("A", "Item A"),
      req("B", "Item B"),
      req("B", "Item B"),
      req("C", "Item C"),
    ];
    const top = findTopReturnedProducts(requests, 2);
    expect(top).toHaveLength(2);
    expect(top[0]?.asin).toBe("A");
    expect(top[0]?.count).toBe(3);
    expect(top[1]?.asin).toBe("B");
  });
  it("returns [] for empty input", () => {
    expect(findTopReturnedProducts([], 5)).toEqual([]);
  });
});

describe("calculateReturnsByCategory", () => {
  it("aggregates request counts by ASIN's inferred category from items", () => {
    const items = [
      createOrderItem({ asin: "A", inferredCategory: "elektronik" }),
      createOrderItem({ asin: "B", inferredCategory: "buecher" }),
      createOrderItem({ asin: "C", inferredCategory: "kueche" }),
    ];
    const requests: ReturnRequest[] = [
      { orderId: "O1", asin: "A", productName: "x", reasonCode: "CR" },
      { orderId: "O2", asin: "A", productName: "x", reasonCode: "CR" },
      { orderId: "O3", asin: "B", productName: "y", reasonCode: "CR" },
      { orderId: "O4", asin: "Z-unknown", productName: "z", reasonCode: "CR" },
    ];
    const dist = calculateReturnsByCategory(requests, items);
    expect(dist.get("elektronik")).toBe(2);
    expect(dist.get("buecher")).toBe(1);
    expect(dist.get("sonstiges")).toBe(1); // unknown ASIN falls back
  });
});

describe("calculateCarrierDistribution", () => {
  it("extracts carrier name from 'Carrier Name & Tracking Number' field", () => {
    const items = [
      createOrderItem({ carrierAndTracking: "AMZN_DE(1Z999)" }),
      createOrderItem({ carrierAndTracking: "AMZN_DE(1Z888)" }),
      createOrderItem({ carrierAndTracking: "DHL(5500)" }),
      createOrderItem({ carrierAndTracking: "Hermes(H123)" }),
    ];
    const dist = calculateCarrierDistribution(items);
    expect(dist.get("AMZN_DE")).toBe(2);
    expect(dist.get("DHL")).toBe(1);
    expect(dist.get("Hermes")).toBe(1);
  });

  it("uses 'Unbekannt' for empty carrier strings", () => {
    const items = [createOrderItem({ carrierAndTracking: "" })];
    const dist = calculateCarrierDistribution(items);
    expect(dist.get("Unbekannt")).toBe(1);
  });

  it("returns empty map for empty input", () => {
    expect(calculateCarrierDistribution([]).size).toBe(0);
  });
});
