import { describe, expect, it } from "vitest";
import { aggregateOrders } from "./aggregator";
import { createOrderItem } from "../../test/fixtures/sampleOrders";

describe("aggregateOrders", () => {
  it("returns an empty array for empty input", () => {
    expect(aggregateOrders([])).toEqual([]);
  });

  it("groups 3 items with same orderId into a single aggregate with itemCount 3", () => {
    const items = [
      createOrderItem({ orderId: "O-1", asin: "A1", quantity: 1, totalOwed: 10 }),
      createOrderItem({ orderId: "O-1", asin: "A2", quantity: 1, totalOwed: 20 }),
      createOrderItem({ orderId: "O-1", asin: "A3", quantity: 1, totalOwed: 30 }),
    ];
    const aggs = aggregateOrders(items);
    expect(aggs).toHaveLength(1);
    const agg = aggs[0];
    expect(agg).toBeDefined();
    expect(agg?.orderId).toBe("O-1");
    expect(agg?.items).toHaveLength(3);
    expect(agg?.itemCount).toBe(3);
  });

  it("sums quantity across items in same order", () => {
    const items = [
      createOrderItem({ orderId: "O-1", asin: "A1", quantity: 2 }),
      createOrderItem({ orderId: "O-1", asin: "A2", quantity: 3 }),
    ];
    const agg = aggregateOrders(items)[0];
    expect(agg?.itemCount).toBe(5);
  });

  it("sums totalOwed across items in same order", () => {
    const items = [
      createOrderItem({ orderId: "O-1", asin: "A1", totalOwed: 10.5 }),
      createOrderItem({ orderId: "O-1", asin: "A2", totalOwed: 20.25 }),
    ];
    const agg = aggregateOrders(items)[0];
    expect(agg?.totalOwed).toBeCloseTo(30.75, 2);
  });

  it("produces separate aggregates for different orderIds", () => {
    const items = [
      createOrderItem({ orderId: "O-1", asin: "A1" }),
      createOrderItem({ orderId: "O-2", asin: "A2" }),
      createOrderItem({ orderId: "O-3", asin: "A3" }),
    ];
    const aggs = aggregateOrders(items);
    expect(aggs).toHaveLength(3);
    expect(new Set(aggs.map((a) => a.orderId))).toEqual(new Set(["O-1", "O-2", "O-3"]));
  });

  it("infers isPrime = true when shippingCharge is 0 and shippingOption contains 'premium'", () => {
    const items = [
      createOrderItem({ orderId: "O-1", shippingCharge: 0, shippingOption: "premium" }),
    ];
    expect(aggregateOrders(items)[0]?.isPrime).toBe(true);
  });

  it("infers isPrime = true when shippingOption is capitalized 'PREMIUM'", () => {
    const items = [
      createOrderItem({ orderId: "O-1", shippingCharge: 0, shippingOption: "PREMIUM" }),
    ];
    expect(aggregateOrders(items)[0]?.isPrime).toBe(true);
  });

  it("infers isPrime = true for the current Amazon.de label 'premium-de'", () => {
    const items = [
      createOrderItem({ orderId: "O-1", shippingCharge: 0, shippingOption: "premium-de" }),
    ];
    expect(aggregateOrders(items)[0]?.isPrime).toBe(true);
  });

  it("infers isPrime = true for the current Amazon.de label 'Pri Dom'", () => {
    const items = [
      createOrderItem({ orderId: "O-1", shippingCharge: 0, shippingOption: "Pri Dom" }),
    ];
    expect(aggregateOrders(items)[0]?.isPrime).toBe(true);
  });

  it("infers isPrime = false for standard shipping with charge", () => {
    const items = [
      createOrderItem({ orderId: "O-1", shippingCharge: 3.99, shippingOption: "standard" }),
    ];
    expect(aggregateOrders(items)[0]?.isPrime).toBe(false);
  });

  it("infers isPrime = false when shippingCharge > 0 even with premium option", () => {
    const items = [
      createOrderItem({ orderId: "O-1", shippingCharge: 5, shippingOption: "premium" }),
    ];
    expect(aggregateOrders(items)[0]?.isPrime).toBe(false);
  });

  it("uses the earliest orderDate from items in the group", () => {
    const earlier = new Date("2024-10-21T08:00:00Z");
    const later = new Date("2024-10-21T10:00:00Z");
    const items = [
      createOrderItem({ orderId: "O-1", asin: "A1", orderDate: later }),
      createOrderItem({ orderId: "O-1", asin: "A2", orderDate: earlier }),
    ];
    const agg = aggregateOrders(items)[0];
    expect(agg?.orderDate.toISOString()).toBe(earlier.toISOString());
  });

  it("sums shippingCharge across items (per-item rows in Amazon CSV)", () => {
    const items = [
      createOrderItem({ orderId: "O-1", asin: "A1", shippingCharge: 1.33 }),
      createOrderItem({ orderId: "O-1", asin: "A2", shippingCharge: 1.33 }),
      createOrderItem({ orderId: "O-1", asin: "A3", shippingCharge: 1.33 }),
    ];
    const agg = aggregateOrders(items)[0];
    expect(agg?.shippingCharge).toBeCloseTo(3.99, 2);
  });

  it("returns aggregates sorted by orderDate ascending", () => {
    const items = [
      createOrderItem({ orderId: "O-3", orderDate: new Date("2024-03-01T10:00:00Z") }),
      createOrderItem({ orderId: "O-1", orderDate: new Date("2024-01-01T10:00:00Z") }),
      createOrderItem({ orderId: "O-2", orderDate: new Date("2024-02-01T10:00:00Z") }),
    ];
    const aggs = aggregateOrders(items);
    expect(aggs.map((a) => a.orderId)).toEqual(["O-1", "O-2", "O-3"]);
  });
});
