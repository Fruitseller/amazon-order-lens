import Papa from "papaparse";

// Amazon füllt leere Felder mit diesen Platzhaltern — als Daten wertlos.
const PLACEHOLDERS: ReadonlySet<string> = new Set([
  "",
  "Not Available",
  "Not Applicable",
]);

export type RawRow = Record<string, string | undefined>;

export function pick(raw: RawRow, ...keys: string[]): string {
  for (const key of keys) {
    const v = raw[key];
    if (v !== undefined) return v;
  }
  return "";
}

export function cleanString(raw: string): string {
  const trimmed = raw.trim();
  return PLACEHOLDERS.has(trimmed) ? "" : trimmed;
}

export function nullIfPlaceholder(raw: string): string | null {
  const trimmed = raw.trim();
  return PLACEHOLDERS.has(trimmed) ? null : trimmed;
}

export function parseNumberSafe(raw: string): number {
  if (PLACEHOLDERS.has(raw.trim())) return 0;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

export function parseIntSafe(raw: string): number {
  if (PLACEHOLDERS.has(raw.trim())) return 0;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : 0;
}

export function parseDateSafe(raw: string): Date | null {
  if (PLACEHOLDERS.has(raw.trim())) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function parseCsv(csvString: string): RawRow[] {
  if (!csvString.trim()) return [];
  const result = Papa.parse<RawRow>(csvString, {
    header: true,
    dynamicTyping: false,
    skipEmptyLines: "greedy",
    transformHeader: (h) => h.trim(),
  });
  return result.data;
}
