import { beforeEach, describe, expect, it } from "vitest";
import { resetIndexedDB } from "../../test/helpers/fakeIndexedDB";
import {
  DB_NAME,
  PERSISTED_SCHEMA_VERSION,
  clearData,
  loadData,
  saveData,
} from "./indexedDBService";
import {
  createOrderItem,
  createReturnRecord,
} from "../../test/fixtures/sampleOrders";
import { aggregateOrders } from "./aggregator";

beforeEach(async () => {
  await resetIndexedDB(DB_NAME);
});

describe("indexedDBService", () => {
  it("returns null when loading from an empty database", async () => {
    const result = await loadData();
    expect(result).toBeNull();
  });

  it("round-trips items, orders, and returns via saveData + loadData", async () => {
    const items = [
      createOrderItem({ orderId: "O-1", asin: "A1", productName: "Äöü ß test" }),
      createOrderItem({ orderId: "O-1", asin: "A2" }),
    ];
    const orders = aggregateOrders(items);
    const returns = [createReturnRecord()];

    await saveData({ items, orders, returns, returnRequests: [] });
    const loaded = await loadData();

    expect(loaded).not.toBeNull();
    expect(loaded?.items).toHaveLength(2);
    expect(loaded?.orders).toHaveLength(1);
    expect(loaded?.returns).toHaveLength(1);
    expect(loaded?.items[0]?.productName).toBe("Äöü ß test");
  });

  it("stores data in a versioned envelope", async () => {
    const items = [createOrderItem()];
    await saveData({ items, orders: aggregateOrders(items), returns: [], returnRequests: [] });

    const raw = await new Promise<unknown>((resolve, reject) => {
      const openRequest = indexedDB.open(DB_NAME, 1);
      openRequest.onerror = () => reject(openRequest.error);
      openRequest.onsuccess = () => {
        const db = openRequest.result;
        const tx = db.transaction("orderData", "readonly");
        const getRequest = tx.objectStore("orderData").get("current");
        getRequest.onerror = () => reject(getRequest.error);
        getRequest.onsuccess = () => {
          resolve(getRequest.result);
          db.close();
        };
      };
    });

    expect(raw).toMatchObject({
      schemaVersion: PERSISTED_SCHEMA_VERSION,
      data: { items: expect.any(Array), orders: expect.any(Array) },
    });
  });

  it("preserves Date objects as Date instances after round-trip", async () => {
    const items = [
      createOrderItem({ orderDate: new Date("2024-10-21T12:00:00Z") }),
    ];
    const orders = aggregateOrders(items);

    await saveData({ items, orders, returns: [], returnRequests: [] });
    const loaded = await loadData();

    expect(loaded?.items[0]?.orderDate).toBeInstanceOf(Date);
    expect(loaded?.items[0]?.orderDate.toISOString()).toBe(
      "2024-10-21T12:00:00.000Z",
    );
  });

  it("clearData removes all persisted data", async () => {
    const items = [createOrderItem()];
    const orders = aggregateOrders(items);
    await saveData({ items, orders, returns: [], returnRequests: [] });
    expect(await loadData()).not.toBeNull();

    await clearData();
    expect(await loadData()).toBeNull();
  });

  it("saveData overwrites previous contents", async () => {
    const firstItems = [createOrderItem({ asin: "FIRST" })];
    await saveData({
      items: firstItems,
      orders: aggregateOrders(firstItems),
      returns: [],
      returnRequests: [],
    });

    const secondItems = [
      createOrderItem({ asin: "SECOND-A" }),
      createOrderItem({ asin: "SECOND-B" }),
    ];
    await saveData({
      items: secondItems,
      orders: aggregateOrders(secondItems),
      returns: [],
      returnRequests: [],
    });

    const loaded = await loadData();
    expect(loaded?.items).toHaveLength(2);
    expect(loaded?.items.map((i) => i.asin).sort()).toEqual([
      "SECOND-A",
      "SECOND-B",
    ]);
  });
});
