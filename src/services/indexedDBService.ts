import type { OrderAggregate, OrderItem, ReturnRecord } from "../types/order";

export const DB_NAME = "amazon-order-lens";
const DB_VERSION = 1;
const STORE_NAME = "orderData";
const SINGLETON_KEY = "current";

export interface PersistedData {
  items: OrderItem[];
  orders: OrderAggregate[];
  returns: ReturnRecord[];
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("indexedDB open failed"));
    request.onblocked = () => reject(new Error("indexedDB open blocked"));
  });
}

function txPromise<T>(
  storeMode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, storeMode);
        const store = tx.objectStore(STORE_NAME);
        const request = operation(store);
        request.onsuccess = () => {
          resolve(request.result);
          db.close();
        };
        request.onerror = () => {
          reject(request.error ?? new Error("indexedDB request failed"));
          db.close();
        };
      }),
  );
}

export async function saveData(
  items: OrderItem[],
  orders: OrderAggregate[],
  returns: ReturnRecord[],
): Promise<void> {
  const payload: PersistedData = { items, orders, returns };
  await txPromise("readwrite", (store) => store.put(payload, SINGLETON_KEY));
}

export async function loadData(): Promise<PersistedData | null> {
  const result = (await txPromise(
    "readonly",
    (store) => store.get(SINGLETON_KEY) as IDBRequest<PersistedData | undefined>,
  )) as PersistedData | undefined;
  return result ?? null;
}

export async function clearData(): Promise<void> {
  await txPromise("readwrite", (store) => store.clear());
}
