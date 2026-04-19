import type {
  OrderAggregate,
  OrderItem,
  ProductCategory,
  ReturnRecord,
  ReturnRequest,
} from "../types/order";
import {
  getDayOfWeek,
  getHourOfDay,
  getISOWeekKey,
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

export interface ShoppingEventEntry {
  event: string;
  totalSpending: number;
  orderCount: number;
  itemCount: number;
}

const SHOPPING_EVENT_NAMES = [
  "Black Friday",
  "Cyber Monday",
  "Prime Day",
  "Weihnachten",
] as const;

const PRIME_DAY_DATES: Record<number, readonly string[]> = {
  2015: ["2015-07-15"],
  2016: ["2016-07-12"],
  2017: ["2017-07-11"],
  2018: ["2018-07-16", "2018-07-17"],
  2019: ["2019-07-15", "2019-07-16"],
  2020: ["2020-10-13", "2020-10-14"],
  2021: ["2021-06-21", "2021-06-22"],
  2022: ["2022-07-12", "2022-07-13"],
  2023: ["2023-07-11", "2023-07-12"],
  2024: ["2024-07-16", "2024-07-17"],
  2025: ["2025-07-08", "2025-07-09"],
};

function formatUTCDateKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getBlackFridayDateKey(year: number): string {
  // Thanksgiving: 4th Thursday of November (US). Black Friday is the day after.
  const nov1 = new Date(Date.UTC(year, 10, 1));
  const nov1DowMonZero = (nov1.getUTCDay() + 6) % 7;
  const thuOffset = (3 - nov1DowMonZero + 7) % 7;
  const fourthThursdayDay = 1 + thuOffset + 21;
  const blackFriday = new Date(Date.UTC(year, 10, fourthThursdayDay + 1));
  return formatUTCDateKey(blackFriday);
}

function shiftDateKey(key: string, days: number): string {
  const [y, m, d] = key.split("-").map((s) => parseInt(s, 10));
  const date = new Date(Date.UTC(y ?? 0, (m ?? 1) - 1, (d ?? 1) + days));
  return formatUTCDateKey(date);
}

function buildEventCalendar(years: ReadonlySet<number>): Map<string, string[]> {
  const calendar = new Map<string, string[]>();
  const add = (key: string, event: string) => {
    const list = calendar.get(key);
    if (list) list.push(event);
    else calendar.set(key, [event]);
  };
  for (const year of years) {
    const bf = getBlackFridayDateKey(year);
    add(bf, "Black Friday");
    add(shiftDateKey(bf, 3), "Cyber Monday");
    for (const pd of PRIME_DAY_DATES[year] ?? []) add(pd, "Prime Day");
    for (let day = 1; day <= 24; day++) {
      add(`${year}-12-${String(day).padStart(2, "0")}`, "Weihnachten");
    }
  }
  return calendar;
}

export function calculateShoppingEventStats(
  items: readonly OrderItem[],
  orders: readonly OrderAggregate[],
): ShoppingEventEntry[] {
  const years = new Set<number>();
  for (const item of items) years.add(getYear(item.orderDate));
  const calendar = buildEventCalendar(years);

  const acc = new Map<string, { spending: number; itemCount: number; orderCount: number }>();
  for (const name of SHOPPING_EVENT_NAMES) {
    acc.set(name, { spending: 0, itemCount: 0, orderCount: 0 });
  }

  for (const order of orders) {
    const events = calendar.get(toBerlinDateKey(order.orderDate));
    if (!events) continue;
    for (const event of events) {
      const bucket = acc.get(event);
      if (bucket) bucket.orderCount += 1;
    }
  }

  for (const item of items) {
    const events = calendar.get(toBerlinDateKey(item.orderDate));
    if (!events) continue;
    for (const event of events) {
      const bucket = acc.get(event);
      if (!bucket) continue;
      bucket.spending += item.totalOwed;
      bucket.itemCount += item.quantity;
    }
  }

  return SHOPPING_EVENT_NAMES.map((event) => {
    const bucket = acc.get(event);
    return {
      event,
      totalSpending: bucket?.spending ?? 0,
      orderCount: bucket?.orderCount ?? 0,
      itemCount: bucket?.itemCount ?? 0,
    };
  });
}

export interface RecordPeriod {
  key: string;
  spending: number;
  orderCount: number;
}

function findRecordPeriod(
  items: readonly OrderItem[],
  orders: readonly OrderAggregate[],
  keyFn: (date: Date) => string,
): RecordPeriod | null {
  if (items.length === 0 || orders.length === 0) return null;
  const spending = new Map<string, number>();
  for (const item of items) {
    const key = keyFn(item.orderDate);
    spending.set(key, (spending.get(key) ?? 0) + item.totalOwed);
  }
  const orderCount = new Map<string, number>();
  for (const order of orders) {
    const key = keyFn(order.orderDate);
    orderCount.set(key, (orderCount.get(key) ?? 0) + 1);
  }
  let bestKey = "";
  let bestSpending = -Infinity;
  for (const [key, value] of spending) {
    if (value > bestSpending) {
      bestSpending = value;
      bestKey = key;
    }
  }
  if (bestKey === "") return null;
  return {
    key: bestKey,
    spending: bestSpending,
    orderCount: orderCount.get(bestKey) ?? 0,
  };
}

export function findRecordMonth(
  items: readonly OrderItem[],
  orders: readonly OrderAggregate[],
): RecordPeriod | null {
  return findRecordPeriod(items, orders, getMonthKey);
}

export function findRecordWeek(
  items: readonly OrderItem[],
  orders: readonly OrderAggregate[],
): RecordPeriod | null {
  return findRecordPeriod(items, orders, getISOWeekKey);
}

export function calculateTotalRefunded(returns: readonly ReturnRecord[]): number {
  let sum = 0;
  for (const r of returns) sum += r.refundAmount;
  return sum;
}

export function calculateAverageRefund(returns: readonly ReturnRecord[]): number {
  if (returns.length === 0) return 0;
  return calculateTotalRefunded(returns) / returns.length;
}

export function calculateRefundsByMonth(
  returns: readonly ReturnRecord[],
): Map<string, number> {
  const result = new Map<string, number>();
  for (const r of returns) {
    const key = getMonthKey(r.returnDate);
    result.set(key, (result.get(key) ?? 0) + r.refundAmount);
  }
  return result;
}

export function calculateRefundReasonDistribution(
  returns: readonly ReturnRecord[],
): Map<string, number> {
  const result = new Map<string, number>();
  for (const r of returns) {
    const key = r.reason.trim() || "Unbekannt";
    result.set(key, (result.get(key) ?? 0) + 1);
  }
  return result;
}

export interface TopReturnedProductEntry {
  asin: string;
  productName: string;
  count: number;
}

export function findTopReturnedProducts(
  requests: readonly ReturnRequest[],
  n: number,
): TopReturnedProductEntry[] {
  const map = new Map<string, TopReturnedProductEntry>();
  for (const req of requests) {
    const existing = map.get(req.asin);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(req.asin, { asin: req.asin, productName: req.productName, count: 1 });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count).slice(0, n);
}

export function calculateReturnsByCategory(
  requests: readonly ReturnRequest[],
  items: readonly OrderItem[],
): Map<ProductCategory, number> {
  const asinToCategory = new Map<string, ProductCategory>();
  for (const item of items) {
    if (item.asin && !asinToCategory.has(item.asin)) {
      asinToCategory.set(item.asin, item.inferredCategory);
    }
  }
  const result = new Map<ProductCategory, number>();
  for (const req of requests) {
    const cat: ProductCategory = asinToCategory.get(req.asin) ?? "sonstiges";
    result.set(cat, (result.get(cat) ?? 0) + 1);
  }
  return result;
}

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
