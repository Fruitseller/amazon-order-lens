import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import {
  extractFromZip,
  ZipExtractionError,
  type ExtractedCsvs,
} from "./zipExtractor";

const HEADER =
  "Website,Order ID,Order Date,Purchase Order Number,Currency,Unit Price,Unit Price Tax,Shipping Charge,Total Discounts,Total Owed,Shipment Item Subtotal,Shipment Item Subtotal Tax,ASIN,Product Condition,Quantity,Payment Instrument Type,Order Status,Shipment Status,Ship Date,Shipping Option,Shipping Address,Billing Address,Carrier Name & Tracking Number,Product Name,Gift Message,Gift Sender Name,Gift Recipient Contact Details";

function row(asin: string): string {
  return `Amazon.de,306-1000000-${asin.slice(-7).padStart(7, "0")},2024-10-21T12:00:00Z,,EUR,10.00,1.60,0,0,11.60,10.00,1.60,${asin},new,1,Visa,Closed,Shipped,2024-10-22T10:00:00Z,premium,"Test","Test",,Test Product,,,`;
}

async function makeZip(files: Record<string, string>): Promise<ArrayBuffer> {
  const zip = new JSZip();
  for (const [name, content] of Object.entries(files)) {
    zip.file(name, content);
  }
  return zip.generateAsync({ type: "arraybuffer" });
}

describe("extractFromZip — happy path", () => {
  it("returns the CSV string from a ZIP with a single Retail.OrderHistory.1.csv (legacy format)", async () => {
    const csv = `${HEADER}\n${row("B08AAA0001")}\n`;
    const zipBuf = await makeZip({ "Retail.OrderHistory.1.csv": csv });
    const result: ExtractedCsvs = await extractFromZip(zipBuf);
    expect(result.orderHistoryCsv).toContain("B08AAA0001");
    expect(result.orderHistoryCsv).toContain(HEADER);
  });

  it("extracts from 'Your Amazon Orders/Order History.csv' (current Amazon format)", async () => {
    const csv = `${HEADER}\n${row("B08NEW0001")}\n`;
    const zipBuf = await makeZip({
      "Your Amazon Orders/Order History.csv": csv,
    });
    const result = await extractFromZip(zipBuf);
    expect(result.orderHistoryCsv).toContain("B08NEW0001");
  });

  it("extracts 'Your Amazon Orders/Digital Content Orders.csv' as digitalOrdersCsv", async () => {
    const csv = `${HEADER}\n${row("B08AAA0001")}\n`;
    const zipBuf = await makeZip({
      "Your Amazon Orders/Order History.csv": csv,
      "Your Amazon Orders/Digital Content Orders.csv": "Order ID\nD01-1\n",
    });
    const result = await extractFromZip(zipBuf);
    expect(result.digitalOrdersCsv).toContain("D01-1");
  });

  it("extracts 'Your Returns & Refunds/Refund Details.csv' as refundDetailsCsv", async () => {
    const csv = `${HEADER}\n${row("B08AAA0001")}\n`;
    const zipBuf = await makeZip({
      "Your Amazon Orders/Order History.csv": csv,
      "Your Returns & Refunds/Refund Details.csv":
        '"Creation Date",Currency,"Order ID","Refund Amount"\n2024-01-01,EUR,O-1,10\n',
    });
    const result = await extractFromZip(zipBuf);
    expect(result.refundDetailsCsv).toContain("Refund Amount");
  });

  it("extracts 'Your Returns & Refunds/Return Requests.csv' as returnRequestsCsv", async () => {
    const csv = `${HEADER}\n${row("B08AAA0001")}\n`;
    const zipBuf = await makeZip({
      "Your Amazon Orders/Order History.csv": csv,
      "Your Returns & Refunds/Return Requests.csv":
        "ASIN,Order ID,Product Name,Return Reason Code,Return Shipping Method\nB0,O-1,Test,CR-X,DHL\n",
    });
    const result = await extractFromZip(zipBuf);
    expect(result.returnRequestsCsv).toContain("Return Reason Code");
  });

  it("concatenates multiple Retail.OrderHistory.*.csv files (keeping header only once)", async () => {
    const csv1 = `${HEADER}\n${row("B08AAA0001")}\n`;
    const csv2 = `${HEADER}\n${row("B08AAA0002")}\n`;
    const zipBuf = await makeZip({
      "Retail.OrderHistory.1.csv": csv1,
      "Retail.OrderHistory.2.csv": csv2,
    });
    const result = await extractFromZip(zipBuf);
    expect(result.orderHistoryCsv).toContain("B08AAA0001");
    expect(result.orderHistoryCsv).toContain("B08AAA0002");
    // Header should appear exactly once in concatenated output
    const headerCount = result.orderHistoryCsv.split(HEADER).length - 1;
    expect(headerCount).toBe(1);
  });

  it("handles files nested inside a directory", async () => {
    const csv = `${HEADER}\n${row("B08AAA0001")}\n`;
    const zipBuf = await makeZip({
      "Your Orders/Retail.OrderHistory.1.csv": csv,
    });
    const result = await extractFromZip(zipBuf);
    expect(result.orderHistoryCsv).toContain("B08AAA0001");
  });

  it("also extracts legacy Retail.OrderHistory.Returns.csv as refundDetailsCsv", async () => {
    const csv = `${HEADER}\n${row("B08AAA0001")}\n`;
    const returnsCsv = "Order ID,Refund Amount,Refund Date\n306-1,10,2024-01-01\n";
    const zipBuf = await makeZip({
      "Retail.OrderHistory.1.csv": csv,
      "Retail.OrderHistory.Returns.csv": returnsCsv,
    });
    const result = await extractFromZip(zipBuf);
    expect(result.refundDetailsCsv).toContain("306-1");
  });

  it("returns null for optional files when absent", async () => {
    const csv = `${HEADER}\n${row("B08AAA0001")}\n`;
    const zipBuf = await makeZip({ "Retail.OrderHistory.1.csv": csv });
    const result = await extractFromZip(zipBuf);
    expect(result.refundDetailsCsv).toBeNull();
    expect(result.returnRequestsCsv).toBeNull();
    expect(result.digitalOrdersCsv).toBeNull();
  });

  it("extracts Digital.Orders.csv when present", async () => {
    const csv = `${HEADER}\n${row("B08AAA0001")}\n`;
    const digital = "Order ID,ASIN\n306-D1,B08DIG0001\n";
    const zipBuf = await makeZip({
      "Retail.OrderHistory.1.csv": csv,
      "Digital.Orders.csv": digital,
    });
    const result = await extractFromZip(zipBuf);
    expect(result.digitalOrdersCsv).toContain("B08DIG0001");
  });
});

describe("extractFromZip — error handling", () => {
  it("throws ZipExtractionError when no order history CSV is found", async () => {
    const zipBuf = await makeZip({ "Some.Other.File.csv": "nothing" });
    await expect(extractFromZip(zipBuf)).rejects.toThrow(ZipExtractionError);
  });

  it("error message references the current expected file name", async () => {
    const zipBuf = await makeZip({ "Some.Other.File.csv": "nothing" });
    await expect(extractFromZip(zipBuf)).rejects.toThrow(/Order History\.csv/i);
  });

  it("throws ZipExtractionError when the file is not a valid ZIP", async () => {
    const notAZip = new TextEncoder().encode("this is plain text, not a zip").buffer;
    await expect(extractFromZip(notAZip)).rejects.toThrow(ZipExtractionError);
  });

  it("throws ZipExtractionError for an empty buffer", async () => {
    await expect(extractFromZip(new ArrayBuffer(0))).rejects.toThrow(ZipExtractionError);
  });
});
