import type { OrderAggregate, OrderItem, ReturnRecord } from "../types/order";
import { parseOrderItems } from "../services/parser";
import { aggregateOrders } from "../services/aggregator";
import { extractFromZip } from "../services/zipExtractor";

export type ParserWorkerInput =
  | { kind: "zip"; data: ArrayBuffer | Uint8Array }
  | { kind: "csv"; data: string };

export interface ParserWorkerResult {
  items: OrderItem[];
  orders: OrderAggregate[];
  returns: ReturnRecord[];
}

export type ProgressListener = (percent: number) => void;

export async function runParserWorkerLogic(
  input: ParserWorkerInput,
  onProgress?: ProgressListener,
): Promise<ParserWorkerResult> {
  onProgress?.(5);

  let csv: string;
  const returns: ReturnRecord[] = [];

  if (input.kind === "zip") {
    const extracted = await extractFromZip(input.data);
    csv = extracted.orderHistoryCsv;
    onProgress?.(40);
  } else {
    csv = input.data;
    onProgress?.(20);
  }

  onProgress?.(60);
  const items = parseOrderItems(csv);
  onProgress?.(80);
  const orders = aggregateOrders(items);
  onProgress?.(100);

  return { items, orders, returns };
}
