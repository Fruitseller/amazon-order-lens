import { describe, expect, it } from "vitest";
import { parseRefundDetails, parseReturnRequests } from "./returnsParser";

describe("parseRefundDetails", () => {
  const HEADER =
    "Creation Date,Currency,Direct Debit Refund Amount,Disbursement Type,Order ID,Payment Status,Quantity,Refund Amount,Refund Date,Reversal Amount State,Reversal Reason,Reversal Status,Website";

  it("parses a row from the official Refund Details schema", () => {
    const csv = `${HEADER}\n2025-01-05T14:27:19.153Z,EUR,0,Refund,305-0240677-1763530,Completed,1,27.93,2025-01-05T15:11:48.243Z,Final,Customer return,Completed,Amazon.de\n`;
    const records = parseRefundDetails(csv);
    expect(records).toHaveLength(1);
    const r = records[0];
    expect(r?.orderId).toBe("305-0240677-1763530");
    expect(r?.refundAmount).toBeCloseTo(27.93, 2);
    expect(r?.currency).toBe("EUR");
    expect(r?.quantity).toBe(1);
    expect(r?.reason).toBe("Customer return");
    expect(r?.returnDate?.toISOString()).toBe("2025-01-05T15:11:48.243Z");
  });

  it("falls back to Creation Date when Refund Date is missing", () => {
    const csv = `${HEADER}\n2025-01-05T14:27:19.153Z,EUR,0,Refund,O-1,Completed,1,10.00,,Final,Customer return,Completed,Amazon.de\n`;
    const records = parseRefundDetails(csv);
    expect(records[0]?.returnDate?.toISOString()).toBe("2025-01-05T14:27:19.153Z");
  });

  it("skips rows without an Order ID", () => {
    const csv = `${HEADER}\n2025-01-05T14:27:19.153Z,EUR,0,Refund,,Completed,1,27.93,2025-01-05T15:11:48.243Z,Final,Customer return,Completed,Amazon.de\n`;
    expect(parseRefundDetails(csv)).toEqual([]);
  });

  it("skips rows without a parseable date", () => {
    const csv = `${HEADER}\n,EUR,0,Refund,O-1,Completed,1,10.00,,Final,Customer return,Completed,Amazon.de\n`;
    expect(parseRefundDetails(csv)).toEqual([]);
  });

  it("returns [] for empty input", () => {
    expect(parseRefundDetails("")).toEqual([]);
    expect(parseRefundDetails("   \n  ")).toEqual([]);
  });

  it("parses multiple rows", () => {
    const csv = `${HEADER}\n2025-01-05T14:27:19.153Z,EUR,0,Refund,O-1,Completed,1,10.00,2025-01-05T15:11:48.243Z,Final,Customer return,Completed,Amazon.de\n2025-02-05T14:27:19.153Z,EUR,0,Refund,O-2,Completed,2,20.50,2025-02-05T15:11:48.243Z,Final,Defective,Completed,Amazon.de\n`;
    const records = parseRefundDetails(csv);
    expect(records).toHaveLength(2);
    expect(records[1]?.refundAmount).toBeCloseTo(20.5, 2);
    expect(records[1]?.quantity).toBe(2);
    expect(records[1]?.reason).toBe("Defective");
  });
});

describe("parseReturnRequests", () => {
  const HEADER = "ASIN,Order ID,Product Name,Return Reason Code,Return Shipping Method";

  it("parses a row from the official Return Requests schema", () => {
    const csv = `${HEADER}\nB0DSJMB5B8,305-1160116-6406719,Home4You Wäschekorb,CR-QUALITY_UNACCEPTABLE,DHL_PAKET_MFN_AMZN_RETURNS\n`;
    const records = parseReturnRequests(csv);
    expect(records).toHaveLength(1);
    const r = records[0];
    expect(r?.asin).toBe("B0DSJMB5B8");
    expect(r?.orderId).toBe("305-1160116-6406719");
    expect(r?.productName).toBe("Home4You Wäschekorb");
    expect(r?.reasonCode).toBe("CR-QUALITY_UNACCEPTABLE");
  });

  it("skips rows without an Order ID", () => {
    const csv = `${HEADER}\nB0,,Some product,CR-X,DHL\n`;
    expect(parseReturnRequests(csv)).toEqual([]);
  });

  it("returns [] for empty input", () => {
    expect(parseReturnRequests("")).toEqual([]);
  });
});
