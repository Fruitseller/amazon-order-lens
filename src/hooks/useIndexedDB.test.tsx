import { beforeEach, describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { useIndexedDB } from "./useIndexedDB";
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

describe("useIndexedDB", () => {
  it("hydrates app state from persisted data on mount", async () => {
    const items = [
      createOrderItem({ asin: "PERSIST-A" }),
      createOrderItem({ asin: "PERSIST-B" }),
    ];
    const orders = aggregateOrders(items);
    await saveData(items, orders, []);

    const { result } = renderHook(
      () => ({ _hook: useIndexedDB(), state: useAppState() }),
      { wrapper: Wrapper },
    );

    await waitFor(() => {
      expect(result.current.state.isDataLoaded).toBe(true);
    });
    expect(result.current.state.items.map((i) => i.asin).sort()).toEqual([
      "PERSIST-A",
      "PERSIST-B",
    ]);
  });

  it("leaves state untouched when there is nothing persisted", async () => {
    const { result } = renderHook(
      () => ({ _hook: useIndexedDB(), state: useAppState() }),
      { wrapper: Wrapper },
    );
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(result.current.state.isDataLoaded).toBe(false);
    expect(result.current.state.items).toEqual([]);
  });

  it("exposes a clear helper that wipes both state and IndexedDB", async () => {
    const items = [createOrderItem({ asin: "WIPE-A" })];
    const orders = aggregateOrders(items);
    await saveData(items, orders, []);

    const { result } = renderHook(
      () => ({ hook: useIndexedDB(), state: useAppState() }),
      { wrapper: Wrapper },
    );
    await waitFor(() => {
      expect(result.current.state.isDataLoaded).toBe(true);
    });

    await result.current.hook.clear();
    await waitFor(() => {
      expect(result.current.state.isDataLoaded).toBe(false);
    });
    expect(result.current.state.items).toEqual([]);

    // And IndexedDB should also be empty
    const { loadData } = await import("../services/indexedDBService");
    expect(await loadData()).toBeNull();
  });
});
