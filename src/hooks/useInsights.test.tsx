import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { useInsights } from "./useInsights";
import { AppProvider, useAppDispatch } from "../context/AppContext";
import { createOrderItem } from "../../test/fixtures/sampleOrders";
import { aggregateOrders } from "../services/aggregator";
import type { AppState } from "../types/state";

function wrapperFor(initialOverride: Partial<AppState>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <AppProvider initialOverride={initialOverride}>{children}</AppProvider>;
  };
}

describe("useInsights", () => {
  it("aggregates core KPIs from filtered data", () => {
    const items = [
      createOrderItem({
        orderId: "O-1",
        asin: "A",
        totalOwed: 30,
        quantity: 2,
        orderDate: new Date("2024-01-15T10:00:00Z"),
      }),
      createOrderItem({
        orderId: "O-2",
        asin: "B",
        totalOwed: 70,
        quantity: 1,
        orderDate: new Date("2024-06-15T10:00:00Z"),
      }),
    ];
    const orders = aggregateOrders(items);
    const { result } = renderHook(() => useInsights(), {
      wrapper: wrapperFor({ items, orders, isDataLoaded: true }),
    });
    expect(result.current.totalSpending).toBeCloseTo(100, 2);
    expect(result.current.orderCount).toBe(2);
    expect(result.current.itemCount).toBe(3);
    expect(result.current.averageOrderValue).toBeCloseTo(50, 2);
  });

  it("returns zero/null defaults for empty data", () => {
    const { result } = renderHook(() => useInsights(), {
      wrapper: wrapperFor({}),
    });
    expect(result.current.totalSpending).toBe(0);
    expect(result.current.orderCount).toBe(0);
    expect(result.current.averageOrderValue).toBe(0);
    expect(result.current.firstOrderDate).toBeNull();
    expect(result.current.lastOrderDate).toBeNull();
    expect(result.current.busiestDay).toBeNull();
    expect(result.current.longestGap).toBeNull();
    expect(result.current.fulfillmentSpeedDays).toBeNull();
  });

  it("exposes first and last order dates and days active", () => {
    const items = [
      createOrderItem({
        orderId: "O-1",
        orderDate: new Date("2022-01-01T10:00:00Z"),
      }),
      createOrderItem({
        orderId: "O-2",
        orderDate: new Date("2024-01-01T10:00:00Z"),
      }),
    ];
    const orders = aggregateOrders(items);
    const { result } = renderHook(() => useInsights(), {
      wrapper: wrapperFor({ items, orders, isDataLoaded: true }),
    });
    expect(result.current.firstOrderDate?.toISOString()).toBe(
      "2022-01-01T10:00:00.000Z",
    );
    expect(result.current.lastOrderDate?.toISOString()).toBe(
      "2024-01-01T10:00:00.000Z",
    );
    expect(result.current.daysActive).toBeGreaterThan(700);
  });

  it("exposes spending breakdowns as maps", () => {
    const items = [
      createOrderItem({
        orderId: "O-1",
        inferredCategory: "elektronik",
        totalOwed: 50,
        orderDate: new Date("2024-01-15T10:00:00Z"),
      }),
      createOrderItem({
        orderId: "O-2",
        inferredCategory: "buecher",
        totalOwed: 20,
        orderDate: new Date("2024-06-15T10:00:00Z"),
      }),
    ];
    const orders = aggregateOrders(items);
    const { result } = renderHook(() => useInsights(), {
      wrapper: wrapperFor({ items, orders, isDataLoaded: true }),
    });
    expect(result.current.spendingByCategory.get("elektronik")).toBeCloseTo(50, 2);
    expect(result.current.spendingByCategory.get("buecher")).toBeCloseTo(20, 2);
    expect(result.current.spendingByMonth.get("2024-01")).toBeCloseTo(50, 2);
    expect(result.current.spendingByYear.get(2024)).toBeCloseTo(70, 2);
  });

  it("computes gift count and total savings from discounts", () => {
    const items = [
      createOrderItem({
        orderId: "O-1",
        asin: "A",
        isGift: true,
        giftMessage: "hi",
        totalDiscounts: 5,
      }),
      createOrderItem({
        orderId: "O-2",
        asin: "B",
        totalDiscounts: 3,
      }),
      createOrderItem({
        orderId: "O-3",
        asin: "C",
        isGift: true,
        giftMessage: "hello",
        totalDiscounts: 0,
      }),
    ];
    const orders = aggregateOrders(items);
    const { result } = renderHook(() => useInsights(), {
      wrapper: wrapperFor({ items, orders, isDataLoaded: true }),
    });
    expect(result.current.giftCount).toBe(2);
    expect(result.current.totalSavings).toBeCloseTo(8, 2);
  });

  it("counts payment methods once per order and prefers known values", () => {
    const items = [
      createOrderItem({
        orderId: "O-1",
        asin: "A",
        paymentInstrumentType: "",
      }),
      createOrderItem({
        orderId: "O-1",
        asin: "B",
        paymentInstrumentType: "Visa",
      }),
      createOrderItem({
        orderId: "O-2",
        asin: "C",
        paymentInstrumentType: "",
      }),
    ];
    const orders = aggregateOrders(items);
    const { result } = renderHook(() => useInsights(), {
      wrapper: wrapperFor({ items, orders, isDataLoaded: true }),
    });

    expect(result.current.paymentMethodDistribution.get("Visa")).toBe(1);
    expect(result.current.paymentMethodDistribution.get("Unbekannt")).toBe(1);
  });

  it("reacts to filter changes and recomputes", () => {
    const items = [
      createOrderItem({
        orderId: "O-1",
        asin: "A",
        totalOwed: 30,
        orderDate: new Date("2024-01-15T10:00:00Z"),
      }),
      createOrderItem({
        orderId: "O-2",
        asin: "B",
        totalOwed: 70,
        orderDate: new Date("2024-06-15T10:00:00Z"),
      }),
    ];
    const orders = aggregateOrders(items);
    const { result } = renderHook(
      () => ({ insights: useInsights(), dispatch: useAppDispatch() }),
      {
        wrapper: wrapperFor({ items, orders, isDataLoaded: true }),
      },
    );
    expect(result.current.insights.totalSpending).toBeCloseTo(100, 2);

    act(() => {
      result.current.dispatch({
        type: "SET_DATE_RANGE",
        range: {
          from: new Date("2024-05-01T00:00:00Z"),
          to: new Date("2024-12-31T23:59:59Z"),
        },
      });
    });
    expect(result.current.insights.totalSpending).toBeCloseTo(70, 2);
    expect(result.current.insights.orderCount).toBe(1);
  });

  it("memoizes the insights object between renders with same inputs", () => {
    const items = [createOrderItem()];
    const orders = aggregateOrders(items);
    const { result, rerender } = renderHook(() => useInsights(), {
      wrapper: wrapperFor({ items, orders, isDataLoaded: true }),
    });
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});
