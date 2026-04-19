import { useMemo } from "react";
import { useFilteredData } from "./useFilteredData";
import {
  INVESTMENT_ANNUAL_RATE,
  PRIME_SHIPPING_COST_EUR,
} from "../utils/constants";
import type { ProductCategory } from "../types/order";
import {
  calculateAverageOrderValue,
  calculateCarrierDistribution,
  calculateDayOfWeekDistribution,
  calculateFulfillmentSpeed,
  calculateHourDistribution,
  calculateInvestmentOpportunityCost,
  calculatePrimeSavingsEstimate,
  calculateSpendingByCategory,
  calculateSpendingByMonth,
  calculateSpendingByYear,
  calculateTotalSpending,
  findBusiestDay,
  findLongestGap,
  findRepeatPurchases,
  findTopItems,
  type BusiestDayResult,
  type GapResult,
  type RepeatPurchaseEntry,
  type TopItemEntry,
} from "../services/statistics";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface Insights {
  totalSpending: number;
  orderCount: number;
  itemCount: number;
  averageOrderValue: number;

  firstOrderDate: Date | null;
  lastOrderDate: Date | null;
  daysActive: number | null;
  spendingPerDay: number | null;

  spendingByMonth: Map<string, number>;
  spendingByYear: Map<number, number>;
  spendingByCategory: Map<ProductCategory, number>;

  dayOfWeekDistribution: number[];
  hourDistribution: number[];

  topItems: TopItemEntry[];
  repeatPurchases: RepeatPurchaseEntry[];

  investmentOpportunityCost: number;
  primeSavingsEstimate: number;
  longestGap: GapResult | null;
  busiestDay: BusiestDayResult | null;
  fulfillmentSpeedDays: number | null;
  carrierDistribution: Map<string, number>;

  paymentMethodDistribution: Map<string, number>;

  giftCount: number;
  totalSavings: number;
}

export function useInsights(): Insights {
  const { items, orders } = useFilteredData();

  return useMemo<Insights>(() => {
    let firstOrderDate: Date | null = null;
    let lastOrderDate: Date | null = null;
    let totalSavings = 0;
    let itemCount = 0;
    const giftOrderIds = new Set<string>();
    const paymentMap = new Map<string, number>();

    for (const item of items) {
      const ts = item.orderDate.getTime();
      if (!firstOrderDate || ts < firstOrderDate.getTime()) firstOrderDate = item.orderDate;
      if (!lastOrderDate || ts > lastOrderDate.getTime()) lastOrderDate = item.orderDate;
      totalSavings += item.totalDiscounts;
      itemCount += item.quantity;
      if (item.isGift) giftOrderIds.add(item.orderId);
      const key = item.paymentInstrumentType || "Unbekannt";
      paymentMap.set(key, (paymentMap.get(key) ?? 0) + 1);
    }

    const totalSpending = calculateTotalSpending(items);
    let daysActive: number | null = null;
    let spendingPerDay: number | null = null;
    if (firstOrderDate && lastOrderDate) {
      const diff = Math.max(
        1,
        Math.round(
          (lastOrderDate.getTime() - firstOrderDate.getTime()) / MS_PER_DAY,
        ) + 1,
      );
      daysActive = diff;
      spendingPerDay = totalSpending / diff;
    }

    return {
      totalSpending,
      orderCount: orders.length,
      itemCount,
      averageOrderValue: calculateAverageOrderValue(orders),

      firstOrderDate,
      lastOrderDate,
      daysActive,
      spendingPerDay,

      spendingByMonth: calculateSpendingByMonth(items),
      spendingByYear: calculateSpendingByYear(items),
      spendingByCategory: calculateSpendingByCategory(items),

      dayOfWeekDistribution: calculateDayOfWeekDistribution(items),
      hourDistribution: calculateHourDistribution(items),

      topItems: findTopItems(items, 20),
      repeatPurchases: findRepeatPurchases(items, 3),

      investmentOpportunityCost: calculateInvestmentOpportunityCost(
        items,
        INVESTMENT_ANNUAL_RATE,
      ),
      primeSavingsEstimate: calculatePrimeSavingsEstimate(
        orders,
        PRIME_SHIPPING_COST_EUR,
      ),
      longestGap: findLongestGap(orders),
      busiestDay: findBusiestDay(orders),
      fulfillmentSpeedDays: calculateFulfillmentSpeed(items),
      carrierDistribution: calculateCarrierDistribution(items),

      paymentMethodDistribution: paymentMap,

      giftCount: giftOrderIds.size,
      totalSavings,
    };
  }, [items, orders]);
}
