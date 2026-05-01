import type { OrderItem } from "../types/order";
import { MS_PER_DAY } from "../utils/dateUtils";
import { inferCategory } from "./categoryInference";
import {
  cleanString,
  nullIfPlaceholder,
  parseCsv,
  parseDateSafe,
  parseIntSafe,
  parseNumberSafe,
  pick,
  type RawRow,
} from "./csvHelpers";

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
  const items: OrderItem[] = [];
  for (const raw of parseCsv(csvString)) {
    const item = rawToOrderItem(raw);
    if (item) items.push(item);
  }
  return items;
}
