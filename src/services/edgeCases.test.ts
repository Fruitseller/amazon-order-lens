import { describe, expect, it } from "vitest";
import { parseOrderItems } from "./parser";
import { aggregateOrders } from "./aggregator";
import {
  calculateInvestmentOpportunityCost,
  calculateTotalSpending,
  findBusiestDay,
} from "./statistics";

const HEADER =
  "Website,Order ID,Order Date,Purchase Order Number,Currency,Unit Price,Unit Price Tax,Shipping Charge,Total Discounts,Total Owed,Shipment Item Subtotal,Shipment Item Subtotal Tax,ASIN,Product Condition,Quantity,Payment Instrument Type,Order Status,Shipment Status,Ship Date,Shipping Option,Shipping Address,Billing Address,Carrier Name & Tracking Number,Product Name,Gift Message,Gift Sender Name,Gift Recipient Contact Details";

function row(parts: Partial<Record<string, string>>): string {
  const defaults: Record<string, string> = {
    Website: "Amazon.de",
    OrderId: "306-1000000-0000001",
    OrderDate: "2024-01-01T10:00:00Z",
    Currency: "EUR",
    UnitPrice: "10.00",
    UnitPriceTax: "1.60",
    ShippingCharge: "0",
    TotalDiscounts: "0",
    TotalOwed: "11.60",
    ShipmentItemSubtotal: "10.00",
    ShipmentItemSubtotalTax: "1.60",
    ASIN: "B08EDGE0001",
    Condition: "new",
    Quantity: "1",
    Payment: "Visa",
    OrderStatus: "Closed",
    ShipmentStatus: "Shipped",
    ShipDate: "2024-01-02T10:00:00Z",
    ShippingOption: "premium",
    Product: "Test",
  };
  const merged = { ...defaults, ...parts };
  return [
    merged.Website,
    merged.OrderId,
    merged.OrderDate,
    "",
    merged.Currency,
    merged.UnitPrice,
    merged.UnitPriceTax,
    merged.ShippingCharge,
    merged.TotalDiscounts,
    merged.TotalOwed,
    merged.ShipmentItemSubtotal,
    merged.ShipmentItemSubtotalTax,
    merged.ASIN,
    merged.Condition,
    merged.Quantity,
    merged.Payment,
    merged.OrderStatus,
    merged.ShipmentStatus,
    merged.ShipDate,
    merged.ShippingOption,
    '"Test"',
    '"Test"',
    "",
    merged.Product,
    "",
    "",
    "",
  ].join(",");
}

describe("Edge cases", () => {
  it("handles a CSV with exactly one data row", () => {
    const csv = `${HEADER}\n${row({})}\n`;
    const items = parseOrderItems(csv);
    expect(items).toHaveLength(1);
  });

  it("preserves negative prices (credits / Gutschriften)", () => {
    const csv = `${HEADER}\n${row({ UnitPrice: "-15.00", TotalOwed: "-15.00" })}\n`;
    const items = parseOrderItems(csv);
    expect(items[0]?.unitPrice).toBeCloseTo(-15, 2);
    expect(items[0]?.totalOwed).toBeCloseTo(-15, 2);
    expect(calculateTotalSpending(items)).toBeCloseTo(-15, 2);
  });

  it("accepts dates in the future and still aggregates them", () => {
    const future = "2099-01-01T10:00:00Z";
    const csv = `${HEADER}\n${row({ OrderDate: future })}\n`;
    const items = parseOrderItems(csv);
    expect(items[0]?.orderDate.toISOString()).toBe("2099-01-01T10:00:00.000Z");
    // Investment opportunity cost of a future purchase should be 0 (no elapsed years)
    expect(calculateInvestmentOpportunityCost(items, 0.08, new Date("2024-01-01T00:00:00Z")))
      .toBe(0);
  });

  it("groups duplicate order IDs into a single aggregate", () => {
    const csv = [
      HEADER,
      row({ ASIN: "B08DUP01", OrderId: "306-2000001-0000001" }),
      row({ ASIN: "B08DUP02", OrderId: "306-2000001-0000001" }),
      row({ ASIN: "B08DUP03", OrderId: "306-2000001-0000001" }),
    ].join("\n");
    const items = parseOrderItems(csv);
    const orders = aggregateOrders(items);
    expect(orders).toHaveLength(1);
    expect(orders[0]?.items).toHaveLength(3);
  });

  it("busiest-day logic handles a single order", () => {
    const csv = `${HEADER}\n${row({})}\n`;
    const items = parseOrderItems(csv);
    const orders = aggregateOrders(items);
    const busy = findBusiestDay(orders);
    expect(busy?.count).toBe(1);
  });

  it("empty CSV body (header-only) produces empty items and empty aggregates", () => {
    const csv = `${HEADER}\n`;
    const items = parseOrderItems(csv);
    expect(items).toEqual([]);
    expect(aggregateOrders(items)).toEqual([]);
  });
});
