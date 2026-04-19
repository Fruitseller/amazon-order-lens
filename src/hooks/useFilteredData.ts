import { useMemo } from "react";
import { useAppState } from "../context/AppContext";
import type { OrderAggregate, OrderItem } from "../types/order";

export interface FilteredData {
  items: OrderItem[];
  orders: OrderAggregate[];
}

export function useFilteredData(): FilteredData {
  const { items, orders, dateRange, selectedCategories, searchQuery } = useAppState();

  return useMemo<FilteredData>(() => {
    const fromMs = dateRange.from ? dateRange.from.getTime() : null;
    const toMs = dateRange.to ? dateRange.to.getTime() : null;
    const needle = searchQuery.trim().toLowerCase();
    const categorySet =
      selectedCategories.length > 0 ? new Set(selectedCategories) : null;

    const filteredItems = items.filter((item) => {
      const ts = item.orderDate.getTime();
      if (fromMs !== null && ts < fromMs) return false;
      if (toMs !== null && ts > toMs) return false;
      if (categorySet && !categorySet.has(item.inferredCategory)) return false;
      if (needle && !item.productName.toLowerCase().includes(needle)) return false;
      return true;
    });

    const keptOrderIds = new Set(filteredItems.map((i) => i.orderId));
    const filteredOrders = orders.filter((o) => keptOrderIds.has(o.orderId));

    return { items: filteredItems, orders: filteredOrders };
  }, [items, orders, dateRange, selectedCategories, searchQuery]);
}
