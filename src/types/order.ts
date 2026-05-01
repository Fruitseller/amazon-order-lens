export type ProductCategory =
  | "elektronik"
  | "computer"
  | "haushalt"
  | "kueche"
  | "beauty"
  | "kleidung"
  | "buecher"
  | "spielzeug"
  | "garten"
  | "buero"
  | "lebensmittel"
  | "sonstiges";

export interface OrderItem {
  // Identifikation
  orderId: string;
  asin: string;
  website: string;

  // Zeitstempel
  orderDate: Date;
  shipDate: Date | null;

  // Finanzen
  currency: string;
  unitPrice: number;
  unitPriceTax: number;
  shippingCharge: number;
  totalDiscounts: number;
  totalOwed: number;

  // Produkt
  productName: string;
  productCondition: string;
  quantity: number;

  // Versand
  orderStatus: string;
  shipmentStatus: string;
  shippingOption: string;
  shippingAddress: string;
  billingAddress: string;
  carrierAndTracking: string;

  // Zahlung
  paymentInstrumentType: string;

  // Geschenk
  giftMessage: string | null;
  giftSenderName: string | null;

  // Abgeleitete Felder (nach Parsing berechnet)
  inferredCategory: ProductCategory;
  isGift: boolean;
  fulfillmentDays: number | null;
}

export interface OrderAggregate {
  orderId: string;
  orderDate: Date;
  items: OrderItem[];
  totalOwed: number;
  itemCount: number;
  shippingCharge: number;
  isPrime: boolean;
}

export interface ReturnRecord {
  orderId: string;
  returnDate: Date;
  refundAmount: number;
  currency: string;
  quantity: number;
  reason: string;
  asin?: string;
  productName?: string;
}

export interface ReturnRequest {
  orderId: string;
  asin: string;
  productName: string;
  reasonCode: string;
}
