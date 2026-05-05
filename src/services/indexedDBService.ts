import type {
  OrderAggregate,
  OrderItem,
  ReturnRecord,
  ReturnRequest,
} from "../types/order";

export const DB_NAME = "amazon-order-lens";
export const PERSISTED_SCHEMA_VERSION = 1;
const DB_VERSION = 1;
const STORE_NAME = "orderData";
const SINGLETON_KEY = "current";

export interface PersistedData {
  items: OrderItem[];
  orders: OrderAggregate[];
  returns: ReturnRecord[];
  returnRequests: ReturnRequest[];
}

interface PersistedEnvelope {
  schemaVersion: typeof PERSISTED_SCHEMA_VERSION;
  data: PersistedData;
}

function isPersistedEnvelope(value: unknown): value is PersistedEnvelope {
  return (
    typeof value === "object" &&
    value !== null &&
    "schemaVersion" in value &&
    "data" in value &&
    (value as { schemaVersion: unknown }).schemaVersion === PERSISTED_SCHEMA_VERSION
  );
}

function isLegacyPersistedData(value: unknown): value is PersistedData {
  return (
    typeof value === "object" &&
    value !== null &&
    "items" in value &&
    "orders" in value &&
    "returns" in value &&
    "returnRequests" in value
  );
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
  storeMode: "readonly" | "readwrite",
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

export async function saveData(payload: PersistedData): Promise<void> {
  const envelope: PersistedEnvelope = {
    schemaVersion: PERSISTED_SCHEMA_VERSION,
    data: payload,
  };
  await txPromise("readwrite", (store) => store.put(envelope, SINGLETON_KEY));
}

export async function loadData(): Promise<PersistedData | null> {
  const result = await txPromise(
    "readonly",
    (store) => store.get(SINGLETON_KEY) as IDBRequest<unknown>,
  );

  if (!result) return null;
  if (isPersistedEnvelope(result)) return result.data;
  if (isLegacyPersistedData(result)) return result;
  return null;
}

export async function clearData(): Promise<void> {
  await txPromise("readwrite", (store) => store.clear());
}
