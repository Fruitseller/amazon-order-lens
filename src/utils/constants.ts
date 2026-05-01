import type { ProductCategory } from "../types/order";

export const INVESTMENT_ANNUAL_RATE = 0.08;
export const PRIME_SHIPPING_COST_EUR = 3.99;
export const PACKAGE_CO2_KG = 1.0;

export const CATEGORY_LABELS_DE: Record<ProductCategory, string> = {
  elektronik: "Elektronik",
  computer: "Computer",
  haushalt: "Haushalt",
  kueche: "Küche",
  beauty: "Beauty",
  kleidung: "Kleidung",
  buecher: "Bücher",
  spielzeug: "Spielzeug",
  garten: "Garten",
  buero: "Büro",
  lebensmittel: "Lebensmittel",
  sonstiges: "Sonstiges",
};

export const CATEGORY_ORDER: readonly ProductCategory[] = [
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

export const CHART_COLORS: readonly string[] = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-chart-6)",
  "var(--color-chart-7)",
  "var(--color-chart-8)",
];

// Reihenfolge bestimmt die Sidebar-Reihenfolge und ist die Single Source of Truth
// für gültige View-IDs (siehe `ViewId` in types/state.ts und `VALID_VIEWS` in hashRouter.ts).
export const VIEW_LABELS_DE = {
  overview: "Übersicht",
  spending: "Ausgaben",
  patterns: "Muster",
  categories: "Kategorien",
  returns: "Retouren",
  funfacts: "Fun Facts",
} as const;

export const VIEW_ORDER = Object.keys(VIEW_LABELS_DE) as ReadonlyArray<
  keyof typeof VIEW_LABELS_DE
>;
