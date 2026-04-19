import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { useFilteredData } from "./useFilteredData";
import { AppProvider } from "../context/AppContext";
import {
  createOrderItem,
} from "../../test/fixtures/sampleOrders";
import { aggregateOrders } from "../services/aggregator";
import type { AppState } from "../types/state";

function wrapperFor(initialOverride: Partial<AppState>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <AppProvider initialOverride={initialOverride}>{children}</AppProvider>;
  };
}

describe("useFilteredData", () => {
  it("returns all items and orders when no filter is active", () => {
    const items = [
      createOrderItem({ orderId: "O-1", asin: "A" }),
      createOrderItem({ orderId: "O-2", asin: "B" }),
    ];
    const orders = aggregateOrders(items);
    const { result } = renderHook(() => useFilteredData(), {
      wrapper: wrapperFor({ items, orders, isDataLoaded: true }),
    });
    expect(result.current.items).toHaveLength(2);
    expect(result.current.orders).toHaveLength(2);
  });

  it("filters by dateRange — inclusive of boundaries", () => {
    const items = [
      createOrderItem({
        orderId: "O-1",
        asin: "A",
        orderDate: new Date("2024-01-15T10:00:00Z"),
      }),
      createOrderItem({
        orderId: "O-2",
        asin: "B",
        orderDate: new Date("2024-06-15T10:00:00Z"),
      }),
      createOrderItem({
        orderId: "O-3",
        asin: "C",
        orderDate: new Date("2024-12-15T10:00:00Z"),
      }),
    ];
    const orders = aggregateOrders(items);
    const { result } = renderHook(() => useFilteredData(), {
      wrapper: wrapperFor({
        items,
        orders,
        isDataLoaded: true,
        dateRange: {
          from: new Date("2024-06-01T00:00:00Z"),
          to: new Date("2024-11-30T23:59:59Z"),
        },
      }),
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.asin).toBe("B");
    expect(result.current.orders).toHaveLength(1);
  });

  it("filters by selectedCategories", () => {
    const items = [
      createOrderItem({ orderId: "O-1", asin: "A", inferredCategory: "elektronik" }),
      createOrderItem({ orderId: "O-2", asin: "B", inferredCategory: "buecher" }),
      createOrderItem({ orderId: "O-3", asin: "C", inferredCategory: "kleidung" }),
    ];
    const orders = aggregateOrders(items);
    const { result } = renderHook(() => useFilteredData(), {
      wrapper: wrapperFor({
        items,
        orders,
        isDataLoaded: true,
        selectedCategories: ["elektronik", "buecher"],
      }),
    });
    expect(result.current.items.map((i) => i.asin).sort()).toEqual(["A", "B"]);
  });

  it("filters by searchQuery (case-insensitive substring on productName)", () => {
    const items = [
      createOrderItem({ orderId: "O-1", asin: "A", productName: "USB-C Kabel 2m" }),
      createOrderItem({
        orderId: "O-2",
        asin: "B",
        productName: "Bluetooth Kopfhörer",
      }),
      createOrderItem({ orderId: "O-3", asin: "C", productName: "HDMI Kabel 4K" }),
    ];
    const orders = aggregateOrders(items);
    const { result } = renderHook(() => useFilteredData(), {
      wrapper: wrapperFor({
        items,
        orders,
        isDataLoaded: true,
        searchQuery: "kabel",
      }),
    });
    expect(result.current.items.map((i) => i.asin).sort()).toEqual(["A", "C"]);
  });

  it("combines filters (AND semantics)", () => {
    const items = [
      createOrderItem({
        orderId: "O-1",
        asin: "A",
        inferredCategory: "elektronik",
        productName: "USB Kabel",
        orderDate: new Date("2024-06-15T10:00:00Z"),
      }),
      createOrderItem({
        orderId: "O-2",
        asin: "B",
        inferredCategory: "elektronik",
        productName: "USB Kabel",
        orderDate: new Date("2024-01-15T10:00:00Z"),
      }),
      createOrderItem({
        orderId: "O-3",
        asin: "C",
        inferredCategory: "kleidung",
        productName: "USB Kabel Shirt",
        orderDate: new Date("2024-06-15T10:00:00Z"),
      }),
    ];
    const orders = aggregateOrders(items);
    const { result } = renderHook(() => useFilteredData(), {
      wrapper: wrapperFor({
        items,
        orders,
        isDataLoaded: true,
        selectedCategories: ["elektronik"],
        searchQuery: "usb",
        dateRange: {
          from: new Date("2024-06-01T00:00:00Z"),
          to: new Date("2024-06-30T23:59:59Z"),
        },
      }),
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.asin).toBe("A");
  });

  it("returns empty arrays when no items are loaded", () => {
    const { result } = renderHook(() => useFilteredData(), {
      wrapper: wrapperFor({}),
    });
    expect(result.current.items).toEqual([]);
    expect(result.current.orders).toEqual([]);
  });

  it("preserves order aggregates that contain at least one matching item", () => {
    const items = [
      createOrderItem({ orderId: "O-1", asin: "A", productName: "Kabel" }),
      createOrderItem({ orderId: "O-1", asin: "B", productName: "Buch" }),
      createOrderItem({ orderId: "O-2", asin: "C", productName: "Hose" }),
    ];
    const orders = aggregateOrders(items);
    const { result } = renderHook(() => useFilteredData(), {
      wrapper: wrapperFor({
        items,
        orders,
        isDataLoaded: true,
        searchQuery: "kabel",
      }),
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.orders).toHaveLength(1);
    expect(result.current.orders[0]?.orderId).toBe("O-1");
  });
});
