import Papa from "papaparse";
import type { ReturnRecord, ReturnRequest } from "../types/order";

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

function parseCsv(csvString: string): RawRow[] {
  if (!csvString.trim()) return [];
  const result = Papa.parse<RawRow>(csvString, {
    header: true,
    dynamicTyping: false,
    skipEmptyLines: "greedy",
    transformHeader: (h) => h.trim(),
  });
  return result.data;
}

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
