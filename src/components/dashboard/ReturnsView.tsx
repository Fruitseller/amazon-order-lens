import { useMemo } from "react";
import { useInsights } from "../../hooks/useInsights";
import { SectionCard } from "../shared/SectionCard";
import { KpiCard } from "../shared/KpiCard";
import { DataTable, type DataTableColumn } from "../shared/DataTable";
import { EmptyState } from "../shared/EmptyState";
import { CATEGORY_LABELS_DE, CATEGORY_ORDER } from "../../utils/constants";
import { formatEuro, formatNumber, formatPercent } from "../../utils/formatters";
import type { ProductCategory } from "../../types/order";
import type { TopReturnedProductEntry } from "../../services/statistics";

interface ReasonRow {
  reason: string;
  count: number;
}

interface CategoryRow {
  category: ProductCategory;
  label: string;
  count: number;
}

const productColumns: DataTableColumn<TopReturnedProductEntry>[] = [
  { key: "productName", label: "Produkt", sortable: true },
  { key: "asin", label: "ASIN", sortable: true },
  {
    key: "count",
    label: "Retouren",
    align: "right",
    sortable: true,
    render: (row) => formatNumber(row.count),
  },
];

const reasonColumns: DataTableColumn<ReasonRow>[] = [
  { key: "reason", label: "Grund", sortable: true },
  {
    key: "count",
    label: "Anzahl",
    align: "right",
    sortable: true,
    render: (row) => formatNumber(row.count),
  },
];

const categoryColumns: DataTableColumn<CategoryRow>[] = [
  { key: "label", label: "Kategorie", sortable: true },
  {
    key: "count",
    label: "Retouren",
    align: "right",
    sortable: true,
    render: (row) => formatNumber(row.count),
  },
];

export function ReturnsView() {
  const insights = useInsights();

  const reasonRows = useMemo<ReasonRow[]>(
    () =>
      [...insights.refundReasonDistribution.entries()].map(([reason, count]) => ({
        reason,
        count,
      })),
    [insights.refundReasonDistribution],
  );

  const categoryRows = useMemo<CategoryRow[]>(
    () =>
      CATEGORY_ORDER.filter((cat) => (insights.returnsByCategory.get(cat) ?? 0) > 0)
        .map((cat) => ({
          category: cat,
          label: CATEGORY_LABELS_DE[cat],
          count: insights.returnsByCategory.get(cat) ?? 0,
        })),
    [insights.returnsByCategory],
  );

  const refundRateValue =
    insights.totalSpending > 0
      ? insights.totalRefunded / insights.totalSpending
      : null;
  const refundRateCount =
    insights.orderCount > 0 ? insights.refundCount / insights.orderCount : null;

  if (insights.refundCount === 0 && insights.topReturnedProducts.length === 0) {
    return (
      <EmptyState message="Keine Retouren-Daten gefunden. Im Amazon-Export liegen sie unter 'Your Returns & Refunds/Refund Details.csv' bzw. 'Return Requests.csv'." />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xl)" }}>
      <div
        style={{
          display: "grid",
          gap: "var(--space-md)",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <KpiCard
          label="Erstattet gesamt"
          value={insights.totalRefunded > 0 ? formatEuro(insights.totalRefunded) : null}
          description={
            refundRateValue !== null
              ? `${formatPercent(refundRateValue)} der Ausgaben`
              : undefined
          }
        />
        <KpiCard
          label="Retouren"
          value={insights.refundCount > 0 ? formatNumber(insights.refundCount) : null}
          description={
            refundRateCount !== null
              ? `${formatPercent(refundRateCount)} der Bestellungen`
              : undefined
          }
        />
        <KpiCard
          label="Ø Erstattung"
          value={insights.averageRefund > 0 ? formatEuro(insights.averageRefund) : null}
        />
      </div>

      <SectionCard title="Retourengründe" description="Quelle: Refund Details (Reversal Reason)">
        <DataTable
          columns={reasonColumns}
          data={reasonRows}
          initialSort={{ key: "count", direction: "desc" }}
          emptyMessage="Keine Gründe in den Refund-Details."
        />
      </SectionCard>

      <SectionCard
        title="Top 20 retournierte Produkte"
        description="Quelle: Return Requests"
      >
        <DataTable
          columns={productColumns}
          data={insights.topReturnedProducts}
          initialSort={{ key: "count", direction: "desc" }}
          emptyMessage="Keine Return-Requests im Export."
        />
      </SectionCard>

      <SectionCard
        title="Retouren nach Kategorie"
        description="Verknüpft Return-Request-ASINs mit der Kategorie der zugehörigen Bestellartikel"
      >
        <DataTable
          columns={categoryColumns}
          data={categoryRows}
          initialSort={{ key: "count", direction: "desc" }}
          emptyMessage="Keine ASINs den Bestellungen zuordenbar."
        />
      </SectionCard>
    </div>
  );
}
