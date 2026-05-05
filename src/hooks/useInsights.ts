import { useMemo } from "react";
import { useFilteredData } from "./useFilteredData";
import { useAppState } from "../context/appHooks";
import { calculateInsights, type Insights } from "../services/insights";

export type { Insights } from "../services/insights";

export function useInsights(): Insights {
  const { items, orders } = useFilteredData();
  const { returns, returnRequests } = useAppState();

  return useMemo(
    () => calculateInsights({ items, orders, returns, returnRequests }),
    [items, orders, returns, returnRequests],
  );
}
