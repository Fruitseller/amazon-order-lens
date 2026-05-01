import { beforeEach, describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { useClearPersistedData, useLoadPersistedData } from "./useIndexedDB";
import { useAppState } from "../context/AppContext";
import { AppProvider } from "../context/AppContext";
import { DB_NAME, saveData } from "../services/indexedDBService";
import {
  createOrderItem,
} from "../../test/fixtures/sampleOrders";
import { aggregateOrders } from "../services/aggregator";
import { resetIndexedDB } from "../../test/helpers/fakeIndexedDB";

function Wrapper({ children }: { children: ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}

beforeEach(async () => {
  await resetIndexedDB(DB_NAME);
});

describe("useLoadPersistedData", () => {
  it("hydrates app state from persisted data on mount", async () => {
    const items = [
      createOrderItem({ asin: "PERSIST-A" }),
      createOrderItem({ asin: "PERSIST-B" }),
    ];
    const orders = aggregateOrders(items);
    await saveData({ items, orders, returns: [], returnRequests: [] });

    const { result } = renderHook(
      () => {
        useLoadPersistedData();
        return useAppState();
      },
      { wrapper: Wrapper },
    );

    await waitFor(() => {
      expect(result.current.isDataLoaded).toBe(true);
    });
    expect(result.current.items.map((i) => i.asin).sort()).toEqual([
      "PERSIST-A",
      "PERSIST-B",
    ]);
  });

  it("leaves state untouched when there is nothing persisted", async () => {
    const { result } = renderHook(
      () => {
        useLoadPersistedData();
        return useAppState();
      },
      { wrapper: Wrapper },
    );
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(result.current.isDataLoaded).toBe(false);
    expect(result.current.items).toEqual([]);
  });
});

describe("useClearPersistedData", () => {
  it("wipes both state and IndexedDB", async () => {
    const items = [createOrderItem({ asin: "WIPE-A" })];
    const orders = aggregateOrders(items);
    await saveData({ items, orders, returns: [], returnRequests: [] });

    const { result } = renderHook(
      () => ({
        load: useLoadPersistedData(),
        clear: useClearPersistedData(),
        state: useAppState(),
      }),
      { wrapper: Wrapper },
    );
    await waitFor(() => {
      expect(result.current.state.isDataLoaded).toBe(true);
    });

    await result.current.clear();
    await waitFor(() => {
      expect(result.current.state.isDataLoaded).toBe(false);
    });
    expect(result.current.state.items).toEqual([]);

    const { loadData } = await import("../services/indexedDBService");
    expect(await loadData()).toBeNull();
  });
});
