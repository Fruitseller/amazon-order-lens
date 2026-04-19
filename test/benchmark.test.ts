import { describe, expect, it } from "vitest";
import { parseOrderItems } from "../src/services/parser";
import { aggregateOrders } from "../src/services/aggregator";
import {
  calculateSpendingByCategory,
  calculateSpendingByMonth,
  calculateTotalSpending,
  findRepeatPurchases,
  findTopItems,
} from "../src/services/statistics";

const CSV_HEADER =
  "Website,Order ID,Order Date,Purchase Order Number,Currency,Unit Price,Unit Price Tax,Shipping Charge,Total Discounts,Total Owed,Shipment Item Subtotal,Shipment Item Subtotal Tax,ASIN,Product Condition,Quantity,Payment Instrument Type,Order Status,Shipment Status,Ship Date,Shipping Option,Shipping Address,Billing Address,Carrier Name & Tracking Number,Product Name,Gift Message,Gift Sender Name,Gift Recipient Contact Details";

const PRODUCT_NAMES = [
  "USB-C Kabel 2m",
  "Bluetooth Kopfhörer",
  "Laptop 14 Zoll",
  "Kaffeebohnen Bio",
  "T-Shirt Herren Baumwolle",
  "Schreibtischlampe LED",
  "Puzzle 1000 Teile",
  "Shampoo Anti-Schuppen",
  "Pfanne beschichtet",
  "Taschenbuch Roman",
];

function generateCsv(rowCount: number): string {
  const lines: string[] = [CSV_HEADER];
  const startTs = new Date("2020-01-01T00:00:00Z").getTime();
  for (let i = 0; i < rowCount; i++) {
    const orderId = `306-${String(Math.floor(i / 2)).padStart(7, "0")}-0000001`;
    const ts = new Date(startTs + i * 60 * 60 * 1000).toISOString();
    const shipTs = new Date(startTs + i * 60 * 60 * 1000 + 86400000).toISOString();
    const price = (5 + (i % 100)).toFixed(2);
    const tax = ((5 + (i % 100)) * 0.16).toFixed(2);
    const total = ((5 + (i % 100)) * 1.16).toFixed(2);
    const product = PRODUCT_NAMES[i % PRODUCT_NAMES.length] ?? "Unknown";
    const asin = `B08BENCH${String(i).padStart(4, "0")}`;
    lines.push(
      [
        "Amazon.de",
        orderId,
        ts,
        "",
        "EUR",
        price,
        tax,
        "0",
        "0",
        total,
        price,
        tax,
        asin,
        "new",
        "1",
        "Visa",
        "Closed",
        "Shipped",
        shipTs,
        "premium",
        '"Teststraße 1"',
        '"Teststraße 1"',
        "AMZN_DE(1Z999)",
        product,
        "",
        "",
        "",
      ].join(","),
    );
  }
  return lines.join("\n");
}

describe("Performance benchmark", () => {
  it("parses + aggregates + computes statistics for 10_000 items in under 3 seconds", () => {
    const csv = generateCsv(10_000);
    const start = performance.now();
    const items = parseOrderItems(csv);
    const orders = aggregateOrders(items);
    calculateTotalSpending(items);
    calculateSpendingByMonth(items);
    calculateSpendingByCategory(items);
    findTopItems(items, 20);
    findRepeatPurchases(items, 3);
    const elapsed = performance.now() - start;
    expect(items).toHaveLength(10_000);
    expect(orders.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(3000);
  });
});
