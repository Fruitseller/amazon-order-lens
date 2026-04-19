import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseOrderItems } from "./parser";

const FIXTURES_DIR = join(__dirname, "..", "..", "test", "fixtures");

function loadFixture(name: string): string {
  return readFileSync(join(FIXTURES_DIR, name), "utf-8");
}

describe("parseOrderItems — happy path", () => {
  it("parses a valid CSV fixture into OrderItem[]", () => {
    const csv = loadFixture("sample-orders.csv");
    const items = parseOrderItems(csv);
    expect(items.length).toBeGreaterThan(0);
  });

  it("normalizes all 27 fields into typed OrderItem", () => {
    const csv = loadFixture("sample-orders.csv");
    const items = parseOrderItems(csv);
    const first = items[0];
    expect(first).toBeDefined();
    if (!first) return;
    expect(first.orderId).toBe("306-1000001-0000001");
    expect(first.asin).toBe("B08ABC1001");
    expect(first.website).toBe("Amazon.de");
    expect(first.currency).toBe("EUR");
    expect(first.orderDate).toBeInstanceOf(Date);
    expect(first.orderDate.toISOString()).toBe("2022-03-15T08:32:11.000Z");
    expect(first.unitPrice).toBeCloseTo(12.99, 2);
    expect(first.totalOwed).toBeCloseTo(15.06, 2);
    expect(first.quantity).toBe(1);
    expect(first.productName).toBe("USB-C Kabel 2m geflochten");
    expect(first.inferredCategory).toBe("elektronik");
  });

  it("preserves German umlauts in product name", () => {
    const csv = loadFixture("sample-orders.csv");
    const items = parseOrderItems(csv);
    const kochbuch = items.find((i) => i.asin === "B08ABC1003");
    expect(kochbuch).toBeDefined();
    expect(kochbuch?.productName).toBe("Kochbuch: Französische Küche für Anfänger");
  });

  it("classifies products into correct inferred categories", () => {
    const csv = loadFixture("sample-orders.csv");
    const items = parseOrderItems(csv);
    const laptop = items.find((i) => i.asin === "B08ABC1002");
    expect(laptop?.inferredCategory).toBe("computer");
    const book = items.find((i) => i.asin === "B08ABC1006");
    expect(book?.inferredCategory).toBe("buecher");
  });
});

describe("parseOrderItems — gift handling", () => {
  it("sets isGift true when gift message is present", () => {
    const csv = loadFixture("sample-orders.csv");
    const items = parseOrderItems(csv);
    const giftItem = items.find((i) => i.asin === "B08ABC1006");
    expect(giftItem?.isGift).toBe(true);
    expect(giftItem?.giftMessage).toBe("Alles Gute zum Geburtstag Oma!");
    expect(giftItem?.giftSenderName).toBe("Lisa Musterfrau");
  });

  it("sets isGift false and giftMessage null when empty", () => {
    const csv = loadFixture("sample-orders.csv");
    const items = parseOrderItems(csv);
    const normalItem = items.find((i) => i.asin === "B08ABC1001");
    expect(normalItem?.isGift).toBe(false);
    expect(normalItem?.giftMessage).toBeNull();
    expect(normalItem?.giftSenderName).toBeNull();
  });
});

describe("parseOrderItems — ship date & fulfillment", () => {
  it("parses valid ship date and calculates fulfillmentDays", () => {
    const csv = loadFixture("sample-orders.csv");
    const items = parseOrderItems(csv);
    const item = items.find((i) => i.asin === "B08ABC1001");
    expect(item?.shipDate).toBeInstanceOf(Date);
    expect(item?.fulfillmentDays).toBe(1);
  });

  it("returns null shipDate and null fulfillmentDays for pending orders", () => {
    const csv = loadFixture("sample-orders.csv");
    const items = parseOrderItems(csv);
    const pending = items.find((i) => i.asin === "B08ABC1011");
    expect(pending?.shipDate).toBeNull();
    expect(pending?.fulfillmentDays).toBeNull();
  });
});

describe("parseOrderItems — malformed data", () => {
  it("falls back to 0 for invalid numeric fields", () => {
    const csv = loadFixture("malformed.csv");
    const items = parseOrderItems(csv);
    const bad = items.find((i) => i.asin === "B08BAD0005");
    expect(bad).toBeDefined();
    expect(bad?.unitPrice).toBe(0);
    expect(bad?.unitPriceTax).toBe(0);
    expect(bad?.totalOwed).toBe(0);
  });

  it("skips rows with invalid orderDate (required field)", () => {
    const csv = loadFixture("malformed.csv");
    const items = parseOrderItems(csv);
    // The row with "not-a-date" should be dropped because orderDate is required
    expect(items.find((i) => i.asin === "B08BAD0001")).toBeUndefined();
  });

  it("returns null shipDate for invalid ship date strings", () => {
    const csv = loadFixture("malformed.csv");
    const items = parseOrderItems(csv);
    const item = items.find((i) => i.asin === "B08BAD0002");
    expect(item?.shipDate).toBeNull();
    expect(item?.fulfillmentDays).toBeNull();
  });

  it("falls back to 0 for invalid quantity", () => {
    const csv = loadFixture("malformed.csv");
    const items = parseOrderItems(csv);
    const item = items.find((i) => i.asin === "B08BAD0004");
    expect(item?.quantity).toBe(0);
  });

  it("skips completely empty rows without throwing", () => {
    const csv = loadFixture("malformed.csv");
    expect(() => parseOrderItems(csv)).not.toThrow();
  });
});

describe("parseOrderItems — empty CSV", () => {
  it("returns empty array for header-only CSV", () => {
    const csv = loadFixture("empty.csv");
    expect(parseOrderItems(csv)).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    expect(parseOrderItems("")).toEqual([]);
  });
});

describe("parseOrderItems — current Amazon format (2026)", () => {
  it("parses the current Amazon.de schema with renamed columns", () => {
    const csv = loadFixture("amazon-current-format.csv");
    const items = parseOrderItems(csv);
    expect(items).toHaveLength(3);
  });

  it("maps 'Total Amount' → totalOwed", () => {
    const csv = loadFixture("amazon-current-format.csv");
    const items = parseOrderItems(csv);
    expect(items[0]?.totalOwed).toBeCloseTo(39.95, 2);
  });

  it("maps 'Original Quantity' → quantity", () => {
    const csv = loadFixture("amazon-current-format.csv");
    const items = parseOrderItems(csv);
    expect(items[0]?.quantity).toBe(1);
  });

  it("maps 'Payment Method Type' → paymentInstrumentType", () => {
    const csv = loadFixture("amazon-current-format.csv");
    const items = parseOrderItems(csv);
    expect(items[1]?.paymentInstrumentType).toBe("Visa");
    expect(items[2]?.paymentInstrumentType).toBe("Mastercard");
  });

  it("treats 'Not Available' as null for gift fields (no false-positive gift flag)", () => {
    const csv = loadFixture("amazon-current-format.csv");
    const items = parseOrderItems(csv);
    const nonGift = items[0];
    expect(nonGift?.giftMessage).toBeNull();
    expect(nonGift?.giftSenderName).toBeNull();
    expect(nonGift?.isGift).toBe(false);
  });

  it("treats 'Not Available' as empty for paymentInstrumentType", () => {
    const csv = loadFixture("amazon-current-format.csv");
    const items = parseOrderItems(csv);
    expect(items[0]?.paymentInstrumentType).toBe("");
  });

  it("preserves a real gift message when one is provided", () => {
    const csv = loadFixture("amazon-current-format.csv");
    const items = parseOrderItems(csv);
    const gift = items.find((i) => i.asin === "B0EXAMPLE01");
    expect(gift?.isGift).toBe(true);
    expect(gift?.giftMessage).toBe("Alles Gute zum Geburtstag!");
    expect(gift?.giftSenderName).toBe("Lisa Musterfrau");
  });

  it("preserves umlauts in product name", () => {
    const csv = loadFixture("amazon-current-format.csv");
    const items = parseOrderItems(csv);
    expect(items[0]?.productName).toContain("Bettwäsche");
  });

  it("handles Ship Date with milliseconds", () => {
    const csv = loadFixture("amazon-current-format.csv");
    const items = parseOrderItems(csv);
    expect(items[0]?.shipDate?.toISOString()).toBe("2024-02-09T12:22:09.518Z");
  });
});

describe("parseOrderItems — prime detection prep", () => {
  it("parses shipping option for later prime inference", () => {
    const csv = loadFixture("sample-orders.csv");
    const items = parseOrderItems(csv);
    const prime = items.find((i) => i.asin === "B08ABC1001");
    expect(prime?.shippingCharge).toBe(0);
    expect(prime?.shippingOption.toLowerCase()).toContain("premium");
  });

  it("keeps non-zero shipping charge for standard orders", () => {
    const csv = loadFixture("sample-orders.csv");
    const items = parseOrderItems(csv);
    const standard = items.find((i) => i.asin === "B08ABC1004");
    expect(standard?.shippingCharge).toBeCloseTo(3.99, 2);
    expect(standard?.shippingOption).toBe("standard");
  });
});
