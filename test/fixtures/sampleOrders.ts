import type {
  OrderAggregate,
  OrderItem,
  ProductCategory,
  ReturnRecord,
} from "../../src/types/order";

export function createOrderItem(overrides: Partial<OrderItem> = {}): OrderItem {
  const orderDate = overrides.orderDate ?? new Date("2024-10-21T12:19:08Z");
  const shipDate = overrides.shipDate ?? new Date("2024-10-22T09:00:00Z");
  return {
    orderId: "306-1234567-1234567",
    asin: "B08N5WRWNW",
    website: "Amazon.de",
    orderDate,
    shipDate,
    currency: "EUR",
    unitPrice: 19.99,
    unitPriceTax: 3.19,
    shippingCharge: 0,
    totalDiscounts: 0,
    totalOwed: 23.18,
    productName: "USB-C Kabel 2m",
    productCondition: "new",
    quantity: 1,
    orderStatus: "Closed",
    shipmentStatus: "Shipped",
    shippingOption: "premium",
    shippingAddress: "Musterstraße 1, 10115 Berlin",
    billingAddress: "Musterstraße 1, 10115 Berlin",
    carrierAndTracking: "AMZN_DE(1Z999AA10123456784)",
    paymentInstrumentType: "Visa",
    giftMessage: null,
    giftSenderName: null,
    inferredCategory: "elektronik",
    isGift: false,
    fulfillmentDays: 1,
    ...overrides,
  };
}

export function createOrderAggregate(
  overrides: Partial<OrderAggregate> = {},
): OrderAggregate {
  const items = overrides.items ?? [createOrderItem()];
  const firstItem = items[0];
  if (!firstItem) {
    throw new Error("createOrderAggregate requires at least one item");
  }
  return {
    orderId: firstItem.orderId,
    orderDate: firstItem.orderDate,
    items,
    totalOwed: items.reduce((sum, item) => sum + item.totalOwed, 0),
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    shippingCharge: firstItem.shippingCharge,
    isPrime: firstItem.shippingCharge === 0 && /premium/i.test(firstItem.shippingOption),
    ...overrides,
  };
}

export function createReturnRecord(overrides: Partial<ReturnRecord> = {}): ReturnRecord {
  return {
    orderId: "306-1234567-1234567",
    returnDate: new Date("2024-10-25T10:00:00Z"),
    refundAmount: 23.18,
    currency: "EUR",
    quantity: 1,
    reason: "Customer return",
    ...overrides,
  };
}

export function createItemsAcrossCategories(): OrderItem[] {
  const categories: ProductCategory[] = [
    "elektronik",
    "computer",
    "haushalt",
    "kueche",
    "beauty",
    "kleidung",
    "buecher",
    "spielzeug",
    "garten",
    "buero",
    "lebensmittel",
    "sonstiges",
  ];
  return categories.map((cat, idx) =>
    createOrderItem({
      orderId: `306-0000000-${String(idx).padStart(7, "0")}`,
      asin: `B0TEST${String(idx).padStart(4, "0")}`,
      productName: `Test product ${cat}`,
      inferredCategory: cat,
      unitPrice: 10 + idx,
      totalOwed: 10 + idx,
    }),
  );
}
