import Papa from "papaparse";
import type { OrderItem } from "../types/order";
import { inferCategory } from "./categoryInference";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Amazon füllt leere Felder mit diesen Platzhaltern — als Daten wertlos.
const PLACEHOLDERS: ReadonlySet<string> = new Set([
  "",
  "Not Available",
  "Not Applicable",
]);

type RawRow = Record<string, string | undefined>;

function pick(raw: RawRow, ...keys: string[]): string {
  for (const key of keys) {
    const v = raw[key];
    if (v !== undefined) return v;
  }
  return "";
}

function cleanString(raw: string): string {
  const trimmed = raw.trim();
  return PLACEHOLDERS.has(trimmed) ? "" : trimmed;
}

function nullIfPlaceholder(raw: string): string | null {
  const trimmed = raw.trim();
  return PLACEHOLDERS.has(trimmed) ? null : trimmed;
}

function parseNumberSafe(raw: string): number {
  if (PLACEHOLDERS.has(raw.trim())) return 0;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

function parseIntSafe(raw: string): number {
  if (PLACEHOLDERS.has(raw.trim())) return 0;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : 0;
}

function parseDateSafe(raw: string): Date | null {
  if (PLACEHOLDERS.has(raw.trim())) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function rawToOrderItem(raw: RawRow): OrderItem | null {
  const orderDate = parseDateSafe(pick(raw, "Order Date"));
  if (!orderDate) return null;
  const orderId = cleanString(pick(raw, "Order ID"));
  if (!orderId) return null;

  const shipDate = parseDateSafe(pick(raw, "Ship Date"));
  const fulfillmentDays = shipDate
    ? Math.round((shipDate.getTime() - orderDate.getTime()) / MS_PER_DAY)
    : null;

  const productName = pick(raw, "Product Name");
  const giftMessage = nullIfPlaceholder(pick(raw, "Gift Message"));
  const giftSenderName = nullIfPlaceholder(pick(raw, "Gift Sender Name"));

  return {
    orderId,
    asin: cleanString(pick(raw, "ASIN")),
    website: cleanString(pick(raw, "Website")),
    orderDate,
    shipDate,
    currency: cleanString(pick(raw, "Currency")),
    unitPrice: parseNumberSafe(pick(raw, "Unit Price")),
    unitPriceTax: parseNumberSafe(pick(raw, "Unit Price Tax")),
    shippingCharge: parseNumberSafe(pick(raw, "Shipping Charge")),
    totalDiscounts: parseNumberSafe(pick(raw, "Total Discounts")),
    // Current Amazon-Export: "Total Amount". Legacy: "Total Owed".
    totalOwed: parseNumberSafe(pick(raw, "Total Amount", "Total Owed")),
    productName: productName.trim(),
    productCondition: cleanString(pick(raw, "Product Condition")),
    // Current: "Original Quantity". Legacy: "Quantity".
    quantity: parseIntSafe(pick(raw, "Original Quantity", "Quantity")),
    orderStatus: cleanString(pick(raw, "Order Status")),
    shipmentStatus: cleanString(pick(raw, "Shipment Status")),
    shippingOption: cleanString(pick(raw, "Shipping Option")),
    shippingAddress: cleanString(pick(raw, "Shipping Address")),
    billingAddress: cleanString(pick(raw, "Billing Address")),
    carrierAndTracking: cleanString(pick(raw, "Carrier Name & Tracking Number")),
    // Current: "Payment Method Type". Legacy: "Payment Instrument Type".
    paymentInstrumentType: cleanString(
      pick(raw, "Payment Method Type", "Payment Instrument Type"),
    ),
    giftMessage,
    giftSenderName,
    inferredCategory: inferCategory(productName),
    isGift: giftMessage !== null,
    fulfillmentDays,
  };
}

export function parseOrderItems(csvString: string): OrderItem[] {
  if (!csvString.trim()) return [];

  const result = Papa.parse<RawRow>(csvString, {
    header: true,
    dynamicTyping: false,
    skipEmptyLines: "greedy",
    transformHeader: (h) => h.trim(),
  });

  const items: OrderItem[] = [];
  for (const raw of result.data) {
    const item = rawToOrderItem(raw);
    if (item) items.push(item);
  }
  return items;
}
