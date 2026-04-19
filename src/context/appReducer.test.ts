import { describe, expect, it } from "vitest";
import { appReducer, initialState } from "./appReducer";
import {
  createOrderAggregate,
  createOrderItem,
  createReturnRecord,
} from "../../test/fixtures/sampleOrders";

describe("initialState", () => {
  it("has empty data and default UI state", () => {
    expect(initialState.items).toEqual([]);
    expect(initialState.orders).toEqual([]);
    expect(initialState.returns).toEqual([]);
    expect(initialState.isDataLoaded).toBe(false);
    expect(initialState.isImporting).toBe(false);
    expect(initialState.importProgress).toBe(0);
    expect(initialState.importError).toBeNull();
    expect(initialState.dateRange.from).toBeNull();
    expect(initialState.dateRange.to).toBeNull();
    expect(initialState.selectedCategories).toEqual([]);
    expect(initialState.searchQuery).toBe("");
    expect(initialState.activeView).toBe("overview");
  });
});

describe("appReducer — import actions", () => {
  it("IMPORT_START sets isImporting true and resets progress/error", () => {
    const state = { ...initialState, importError: "old error" };
    const next = appReducer(state, { type: "IMPORT_START" });
    expect(next.isImporting).toBe(true);
    expect(next.importProgress).toBe(0);
    expect(next.importError).toBeNull();
  });

  it("IMPORT_PROGRESS updates importProgress", () => {
    const state = { ...initialState, isImporting: true };
    const next = appReducer(state, { type: "IMPORT_PROGRESS", progress: 42 });
    expect(next.importProgress).toBe(42);
    expect(next.isImporting).toBe(true);
  });

  it("IMPORT_COMPLETE stores data and sets isDataLoaded true", () => {
    const items = [createOrderItem()];
    const orders = [createOrderAggregate()];
    const returns = [createReturnRecord()];
    const next = appReducer(initialState, {
      type: "IMPORT_COMPLETE",
      items,
      orders,
      returns,
    });
    expect(next.items).toBe(items);
    expect(next.orders).toBe(orders);
    expect(next.returns).toBe(returns);
    expect(next.isDataLoaded).toBe(true);
    expect(next.isImporting).toBe(false);
    expect(next.importProgress).toBe(100);
    expect(next.importError).toBeNull();
  });

  it("IMPORT_ERROR sets importError and clears isImporting", () => {
    const state = { ...initialState, isImporting: true, importProgress: 50 };
    const next = appReducer(state, {
      type: "IMPORT_ERROR",
      error: "zip ist kaputt",
    });
    expect(next.isImporting).toBe(false);
    expect(next.importError).toBe("zip ist kaputt");
  });
});

describe("appReducer — filter actions", () => {
  it("SET_DATE_RANGE updates dateRange", () => {
    const range = {
      from: new Date("2024-01-01"),
      to: new Date("2024-12-31"),
    };
    const next = appReducer(initialState, { type: "SET_DATE_RANGE", range });
    expect(next.dateRange).toEqual(range);
  });

  it("SET_CATEGORIES updates selectedCategories", () => {
    const next = appReducer(initialState, {
      type: "SET_CATEGORIES",
      categories: ["elektronik", "buecher"],
    });
    expect(next.selectedCategories).toEqual(["elektronik", "buecher"]);
  });

  it("SET_SEARCH updates searchQuery", () => {
    const next = appReducer(initialState, { type: "SET_SEARCH", query: "kabel" });
    expect(next.searchQuery).toBe("kabel");
  });

  it("SET_VIEW updates activeView", () => {
    const next = appReducer(initialState, { type: "SET_VIEW", view: "spending" });
    expect(next.activeView).toBe("spending");
  });
});

describe("appReducer — CLEAR_DATA", () => {
  it("resets to initialState", () => {
    const dirty = {
      ...initialState,
      items: [createOrderItem()],
      orders: [createOrderAggregate()],
      returns: [createReturnRecord()],
      isDataLoaded: true,
      activeView: "spending" as const,
      searchQuery: "kabel",
    };
    const next = appReducer(dirty, { type: "CLEAR_DATA" });
    expect(next).toEqual(initialState);
  });
});

describe("appReducer — immutability", () => {
  it("does not mutate the input state on IMPORT_PROGRESS", () => {
    const state = { ...initialState };
    const snapshot = JSON.stringify(state);
    appReducer(state, { type: "IMPORT_PROGRESS", progress: 50 });
    expect(JSON.stringify(state)).toBe(snapshot);
  });
});
