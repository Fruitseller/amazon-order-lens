import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import JSZip from "jszip";
import { runParserWorkerLogic } from "./parserWorkerLogic";
import { ZipExtractionError } from "../services/zipExtractor";

const FIXTURES_DIR = join(__dirname, "..", "..", "test", "fixtures");

function loadFixture(name: string): string {
  return readFileSync(join(FIXTURES_DIR, name), "utf-8");
}

async function makeZip(files: Record<string, string>): Promise<ArrayBuffer> {
  const zip = new JSZip();
  for (const [name, content] of Object.entries(files)) zip.file(name, content);
  return zip.generateAsync({ type: "arraybuffer" });
}

describe("runParserWorkerLogic — CSV input", () => {
  it("parses a CSV string and returns items + orders", async () => {
    const csv = loadFixture("sample-orders.csv");
    const result = await runParserWorkerLogic({ kind: "csv", data: csv });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.orders.length).toBeGreaterThan(0);
    expect(result.returns).toEqual([]);
  });

  it("returns aggregates that group items by orderId", async () => {
    const csv = loadFixture("sample-orders.csv");
    const result = await runParserWorkerLogic({ kind: "csv", data: csv });
    const multiOrder = result.orders.find((o) => o.orderId === "306-1000017-0000017");
    expect(multiOrder?.items.length).toBe(3);
  });
});

describe("runParserWorkerLogic — ZIP input", () => {
  it("extracts and parses a ZIP containing Retail.OrderHistory.1.csv", async () => {
    const csv = loadFixture("sample-orders.csv");
    const zipBuf = await makeZip({ "Retail.OrderHistory.1.csv": csv });
    const result = await runParserWorkerLogic({ kind: "zip", data: zipBuf });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.orders.length).toBeGreaterThan(0);
  });

  it("throws ZipExtractionError for a malformed zip", async () => {
    const bad = new TextEncoder().encode("not a zip").buffer;
    await expect(
      runParserWorkerLogic({ kind: "zip", data: bad }),
    ).rejects.toThrow(ZipExtractionError);
  });
});

describe("runParserWorkerLogic — progress callback", () => {
  it("invokes onProgress with monotonically non-decreasing values ending at 100", async () => {
    const csv = loadFixture("sample-orders.csv");
    const progress: number[] = [];
    await runParserWorkerLogic(
      { kind: "csv", data: csv },
      (pct) => progress.push(pct),
    );
    expect(progress.length).toBeGreaterThan(0);
    for (let i = 1; i < progress.length; i++) {
      expect(progress[i]!).toBeGreaterThanOrEqual(progress[i - 1]!);
    }
    expect(progress[progress.length - 1]).toBe(100);
  });
});

describe("runParserWorkerLogic — empty input", () => {
  it("returns empty arrays for an empty CSV header-only fixture", async () => {
    const csv = loadFixture("empty.csv");
    const result = await runParserWorkerLogic({ kind: "csv", data: csv });
    expect(result.items).toEqual([]);
    expect(result.orders).toEqual([]);
  });
});
