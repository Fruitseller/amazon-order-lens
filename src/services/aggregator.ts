import type { OrderAggregate, OrderItem } from "../types/order";

// Amazon.de verwendet je nach Ära verschiedene Labels für Prime-Versand:
// "premium" (legacy), "premium-de", "Pri Dom" (= Priority Domestic / Prime).
const PREMIUM_PATTERN = /\b(?:premium|prime|pri[- _]?dom)\b/i;

export function aggregateOrders(items: readonly OrderItem[]): OrderAggregate[] {
  const groups = new Map<string, OrderItem[]>();
  for (const item of items) {
    const list = groups.get(item.orderId);
    if (list) {
      list.push(item);
    } else {
      groups.set(item.orderId, [item]);
    }
  }

  const aggregates: OrderAggregate[] = [];
  for (const [orderId, orderItems] of groups) {
    let earliest = orderItems[0]?.orderDate ?? new Date();
    let totalOwed = 0;
    let shippingCharge = 0;
    let itemCount = 0;
    let hasPremium = false;
    for (const item of orderItems) {
      if (item.orderDate.getTime() < earliest.getTime()) {
        earliest = item.orderDate;
      }
      totalOwed += item.totalOwed;
      shippingCharge += item.shippingCharge;
      itemCount += item.quantity;
      if (PREMIUM_PATTERN.test(item.shippingOption)) {
        hasPremium = true;
      }
    }

    aggregates.push({
      orderId,
      orderDate: earliest,
      items: orderItems,
      totalOwed,
      itemCount,
      shippingCharge,
      isPrime: shippingCharge === 0 && hasPremium,
    });
  }

  aggregates.sort((a, b) => a.orderDate.getTime() - b.orderDate.getTime());
  return aggregates;
}
