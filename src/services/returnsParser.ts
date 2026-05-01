import type { ReturnRecord, ReturnRequest } from "../types/order";
import {
  cleanString,
  parseCsv,
  parseDateSafe,
  parseIntSafe,
  parseNumberSafe,
  pick,
  type RawRow,
} from "./csvHelpers";

function rowToRefund(raw: RawRow): ReturnRecord | null {
  const orderId = cleanString(pick(raw, "Order ID"));
  if (!orderId) return null;
  const returnDate =
    parseDateSafe(pick(raw, "Refund Date")) ??
    parseDateSafe(pick(raw, "Creation Date"));
  if (!returnDate) return null;
  return {
    orderId,
    returnDate,
    refundAmount: parseNumberSafe(pick(raw, "Refund Amount", "Return Amount")),
    currency: cleanString(pick(raw, "Currency", "Return Amount Currency")),
    quantity: parseIntSafe(pick(raw, "Quantity")),
    reason: cleanString(pick(raw, "Reversal Reason", "Return Reason")),
  };
}

export function parseRefundDetails(csvString: string): ReturnRecord[] {
  const records: ReturnRecord[] = [];
  for (const raw of parseCsv(csvString)) {
    const r = rowToRefund(raw);
    if (r) records.push(r);
  }
  return records;
}

function rowToReturnRequest(raw: RawRow): ReturnRequest | null {
  const orderId = cleanString(pick(raw, "Order ID"));
  if (!orderId) return null;
  return {
    orderId,
    asin: cleanString(pick(raw, "ASIN")),
    productName: cleanString(pick(raw, "Product Name")),
    reasonCode: cleanString(pick(raw, "Return Reason Code")),
  };
}

export function parseReturnRequests(csvString: string): ReturnRequest[] {
  const records: ReturnRequest[] = [];
  for (const raw of parseCsv(csvString)) {
    const r = rowToReturnRequest(raw);
    if (r) records.push(r);
  }
  return records;
}
