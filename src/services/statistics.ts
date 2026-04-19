import type { OrderAggregate, OrderItem, ProductCategory } from "../types/order";
import {
  getDayOfWeek,
  getHourOfDay,
  getMonthKey,
  getYear,
} from "../utils/dateUtils";

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const berlinDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Berlin",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function toBerlinDateKey(date: Date): string {
  return berlinDateFormatter.format(date);
}

export function calculateTotalSpending(items: readonly OrderItem[]): number {
  let sum = 0;
  for (const item of items) sum += item.totalOwed;
  return sum;
}

export function calculateAverageOrderValue(orders: readonly OrderAggregate[]): number {
  if (orders.length === 0) return 0;
  let sum = 0;
  for (const order of orders) sum += order.totalOwed;
  return sum / orders.length;
}

export function calculateSpendingByMonth(
  items: readonly OrderItem[],
): Map<string, number> {
  const result = new Map<string, number>();
  for (const item of items) {
    const key = getMonthKey(item.orderDate);
    result.set(key, (result.get(key) ?? 0) + item.totalOwed);
  }
  return result;
}

export function calculateSpendingByYear(
  items: readonly OrderItem[],
): Map<number, number> {
  const result = new Map<number, number>();
  for (const item of items) {
    const year = getYear(item.orderDate);
    result.set(year, (result.get(year) ?? 0) + item.totalOwed);
  }
  return result;
}

export function calculateSpendingByCategory(
  items: readonly OrderItem[],
): Map<ProductCategory, number> {
  const result = new Map<ProductCategory, number>();
  for (const item of items) {
    result.set(
      item.inferredCategory,
      (result.get(item.inferredCategory) ?? 0) + item.totalOwed,
    );
  }
  return result;
}

export function calculateDayOfWeekDistribution(
  items: readonly OrderItem[],
): number[] {
  const dist = [0, 0, 0, 0, 0, 0, 0];
  for (const item of items) {
    const d = getDayOfWeek(item.orderDate);
    dist[d] = (dist[d] ?? 0) + 1;
  }
  return dist;
}

export function calculateHourDistribution(items: readonly OrderItem[]): number[] {
  const dist = new Array<number>(24).fill(0);
  for (const item of items) {
    const h = getHourOfDay(item.orderDate);
    dist[h] = (dist[h] ?? 0) + 1;
  }
  return dist;
}

export interface TopItemEntry {
  asin: string;
  productName: string;
  quantity: number;
  totalSpent: number;
  occurrences: number;
}

export function findTopItems(items: readonly OrderItem[], n: number): TopItemEntry[] {
  const map = new Map<string, TopItemEntry>();
  for (const item of items) {
    const existing = map.get(item.asin);
    if (existing) {
      existing.quantity += item.quantity;
      existing.totalSpent += item.totalOwed;
      existing.occurrences += 1;
    } else {
      map.set(item.asin, {
        asin: item.asin,
        productName: item.productName,
        quantity: item.quantity,
        totalSpent: item.totalOwed,
        occurrences: 1,
      });
    }
  }
  return [...map.values()]
    .sort((a, b) => b.quantity - a.quantity || b.totalSpent - a.totalSpent)
    .slice(0, n);
}

export interface RepeatPurchaseEntry {
  asin: string;
  productName: string;
  count: number;
  averageIntervalDays: number | null;
  totalSpent: number;
}

export function findRepeatPurchases(
  items: readonly OrderItem[],
  minCount: number,
): RepeatPurchaseEntry[] {
  const groups = new Map<string, OrderItem[]>();
  for (const item of items) {
    const list = groups.get(item.asin);
    if (list) list.push(item);
    else groups.set(item.asin, [item]);
  }

  const result: RepeatPurchaseEntry[] = [];
  for (const [asin, group] of groups) {
    if (group.length < minCount) continue;
    const sorted = [...group].sort(
      (a, b) => a.orderDate.getTime() - b.orderDate.getTime(),
    );
    let avgInterval: number | null = null;
    if (sorted.length >= 2) {
      let sum = 0;
      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const curr = sorted[i];
        if (!prev || !curr) continue;
        sum += (curr.orderDate.getTime() - prev.orderDate.getTime()) / MS_PER_DAY;
      }
      avgInterval = sum / (sorted.length - 1);
    }
    const first = sorted[0];
    result.push({
      asin,
      productName: first?.productName ?? "",
      count: group.length,
      averageIntervalDays: avgInterval,
      totalSpent: group.reduce((s, item) => s + item.totalOwed, 0),
    });
  }

  return result.sort((a, b) => b.count - a.count);
}

export function calculateInvestmentOpportunityCost(
  items: readonly OrderItem[],
  annualRate: number,
  asOf: Date = new Date(),
): number {
  const asOfMs = asOf.getTime();
  let total = 0;
  for (const item of items) {
    const years = (asOfMs - item.orderDate.getTime()) / MS_PER_YEAR;
    if (years <= 0) continue;
    total += item.totalOwed * Math.pow(1 + annualRate, years);
  }
  return total;
}

export function calculatePrimeSavingsEstimate(
  orders: readonly OrderAggregate[],
  standardShippingCost: number,
): number {
  let count = 0;
  for (const order of orders) {
    if (order.shippingCharge === 0) count += 1;
  }
  return count * standardShippingCost;
}

export interface GapResult {
  from: Date;
  to: Date;
  days: number;
}

export function findLongestGap(orders: readonly OrderAggregate[]): GapResult | null {
  if (orders.length < 2) return null;
  const sorted = [...orders].sort(
    (a, b) => a.orderDate.getTime() - b.orderDate.getTime(),
  );
  let longest: GapResult | null = null;
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (!prev || !curr) continue;
    const days = (curr.orderDate.getTime() - prev.orderDate.getTime()) / MS_PER_DAY;
    if (!longest || days > longest.days) {
      longest = { from: prev.orderDate, to: curr.orderDate, days };
    }
  }
  return longest;
}

export interface BusiestDayResult {
  date: string;
  count: number;
}

export function findBusiestDay(
  orders: readonly OrderAggregate[],
): BusiestDayResult | null {
  if (orders.length === 0) return null;
  const counts = new Map<string, number>();
  for (const order of orders) {
    const key = toBerlinDateKey(order.orderDate);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let bestDate = "";
  let bestCount = 0;
  for (const [date, count] of counts) {
    if (count > bestCount) {
      bestDate = date;
      bestCount = count;
    }
  }
  return { date: bestDate, count: bestCount };
}

export function calculateFulfillmentSpeed(items: readonly OrderItem[]): number | null {
  let sum = 0;
  let count = 0;
  for (const item of items) {
    if (item.fulfillmentDays !== null) {
      sum += item.fulfillmentDays;
      count += 1;
    }
  }
  return count === 0 ? null : sum / count;
}

const CARRIER_PATTERN = /^([A-Za-z0-9_]+)\s*\(/;

export function calculateCarrierDistribution(
  items: readonly OrderItem[],
): Map<string, number> {
  const result = new Map<string, number>();
  for (const item of items) {
    const raw = item.carrierAndTracking.trim();
    let carrier = "Unbekannt";
    if (raw) {
      const match = CARRIER_PATTERN.exec(raw);
      carrier = match?.[1] ?? raw;
    }
    result.set(carrier, (result.get(carrier) ?? 0) + 1);
  }
  return result;
}
