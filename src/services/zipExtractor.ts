import JSZip from "jszip";

export interface ExtractedCsvs {
  orderHistoryCsv: string;
  refundDetailsCsv: string | null;
  returnRequestsCsv: string | null;
}

export class ZipExtractionError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ZipExtractionError";
  }
}

// Aktuelles Amazon.de-Export-Format (Stand 2026):
//   Your Amazon Orders/Order History.csv
//   Your Returns & Refunds/Refund Details.csv
// Legacy-Format (vor dem Rename):
//   Retail.OrderHistory.1.csv (+ .2.csv …)
//   Retail.OrderHistory.Returns.csv
const ORDER_HISTORY_LEGACY = /(?:^|\/)Retail\.OrderHistory\.(\d+)\.csv$/i;
const ORDER_HISTORY_CURRENT = /(?:^|\/)Order History(?:\.(\d+))?\.csv$/i;
const REFUND_DETAILS_PATTERNS: readonly RegExp[] = [
  /(?:^|\/)Refund Details\.csv$/i,
  /(?:^|\/)Retail\.OrderHistory\.Returns\.csv$/i,
];
const RETURN_REQUESTS_PATTERNS: readonly RegExp[] = [
  /(?:^|\/)Return Requests\.csv$/i,
];

function stripHeaderLine(csv: string): string {
  const idx = csv.indexOf("\n");
  return idx < 0 ? "" : csv.slice(idx + 1);
}

async function loadZip(input: ArrayBuffer | Uint8Array): Promise<JSZip> {
  try {
    return await JSZip.loadAsync(input);
  } catch (err) {
    throw new ZipExtractionError("Die Datei ist kein gültiges ZIP-Archiv.", { cause: err });
  }
}

function anyMatch(path: string, patterns: readonly RegExp[]): boolean {
  return patterns.some((p) => p.test(path));
}

export async function extractFromZip(
  input: ArrayBuffer | Uint8Array,
): Promise<ExtractedCsvs> {
  if (input.byteLength === 0) {
    throw new ZipExtractionError("Die Datei ist leer.");
  }

  const zip = await loadZip(input);

  const orderHistoryFiles: Array<{ index: number; path: string }> = [];
  let refundDetailsPath: string | null = null;
  let returnRequestsPath: string | null = null;

  for (const [path, file] of Object.entries(zip.files)) {
    if (file.dir) continue;

    const legacyMatch = ORDER_HISTORY_LEGACY.exec(path);
    if (legacyMatch) {
      orderHistoryFiles.push({ index: parseInt(legacyMatch[1] ?? "0", 10), path });
      continue;
    }
    const currentMatch = ORDER_HISTORY_CURRENT.exec(path);
    if (currentMatch) {
      orderHistoryFiles.push({
        index: parseInt(currentMatch[1] ?? "0", 10),
        path,
      });
      continue;
    }
    if (!refundDetailsPath && anyMatch(path, REFUND_DETAILS_PATTERNS)) {
      refundDetailsPath = path;
      continue;
    }
    if (!returnRequestsPath && anyMatch(path, RETURN_REQUESTS_PATTERNS)) {
      returnRequestsPath = path;
    }
  }

  if (orderHistoryFiles.length === 0) {
    throw new ZipExtractionError(
      "Im ZIP-Archiv wurde keine 'Order History.csv' (bzw. 'Retail.OrderHistory.*.csv') gefunden. Stelle sicher, dass du den korrekten Amazon-Datenexport hochlädst — die passende Datei liegt üblicherweise im Ordner 'Your Amazon Orders'.",
    );
  }

  orderHistoryFiles.sort((a, b) => a.index - b.index);

  const parts: string[] = [];
  for (let i = 0; i < orderHistoryFiles.length; i++) {
    const entry = orderHistoryFiles[i];
    if (!entry) continue;
    const file = zip.file(entry.path);
    if (!file) continue;
    const content = await file.async("string");
    parts.push(i === 0 ? content : stripHeaderLine(content));
  }
  const orderHistoryCsv = parts.join("").replace(/\r\n/g, "\n");

  const refundDetailsCsv = refundDetailsPath
    ? (await zip.file(refundDetailsPath)?.async("string")) ?? null
    : null;
  const returnRequestsCsv = returnRequestsPath
    ? (await zip.file(returnRequestsPath)?.async("string")) ?? null
    : null;

  return { orderHistoryCsv, refundDetailsCsv, returnRequestsCsv };
}
