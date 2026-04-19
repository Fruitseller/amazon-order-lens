import type { OrderItem } from "../types/order";

const BERLIN_TZ = "Europe/Berlin";

const berlinPartsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: BERLIN_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  weekday: "short",
  hour12: false,
});

interface BerlinParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  weekday: number;
}

const ISO_WEEKDAY_MAP: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

export const dayOfWeekLabelsDE: ReadonlyArray<string> = [
  "Mo",
  "Di",
  "Mi",
  "Do",
  "Fr",
  "Sa",
  "So",
];

function getBerlinParts(date: Date): BerlinParts {
  const parts = berlinPartsFormatter.formatToParts(date);
  const map: Record<string, string> = {};
  for (const p of parts) {
    map[p.type] = p.value;
  }
  const rawHour = parseInt(map.hour ?? "0", 10);
  return {
    year: parseInt(map.year ?? "0", 10),
    month: parseInt(map.month ?? "0", 10),
    day: parseInt(map.day ?? "0", 10),
    hour: rawHour === 24 ? 0 : rawHour,
    weekday: ISO_WEEKDAY_MAP[map.weekday ?? ""] ?? 0,
  };
}

export function getDayOfWeek(date: Date): number {
  return getBerlinParts(date).weekday;
}

export function getHourOfDay(date: Date): number {
  return getBerlinParts(date).hour;
}

export function getMonthKey(date: Date): string {
  const { year, month } = getBerlinParts(date);
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function getYear(date: Date): number {
  return getBerlinParts(date).year;
}

export function groupByMonth(items: readonly OrderItem[]): Map<string, OrderItem[]> {
  const result = new Map<string, OrderItem[]>();
  for (const item of items) {
    const key = getMonthKey(item.orderDate);
    const list = result.get(key);
    if (list) {
      list.push(item);
    } else {
      result.set(key, [item]);
    }
  }
  return result;
}

export function groupByYear(items: readonly OrderItem[]): Map<number, OrderItem[]> {
  const result = new Map<number, OrderItem[]>();
  for (const item of items) {
    const year = getYear(item.orderDate);
    const list = result.get(year);
    if (list) {
      list.push(item);
    } else {
      result.set(year, [item]);
    }
  }
  return result;
}

export function getDaysBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}
