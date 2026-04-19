import { useInsights } from "../../hooks/useInsights";
import { SectionCard } from "../shared/SectionCard";
import { CategoryBreakdownChart } from "../charts/CategoryBreakdownChart";
import { DataTable, type DataTableColumn } from "../shared/DataTable";
import { formatEuro, formatNumber } from "../../utils/formatters";
import type { TopItemEntry, RepeatPurchaseEntry } from "../../services/statistics";

const topItemsColumns: DataTableColumn<TopItemEntry>[] = [
  { key: "productName", label: "Produkt", sortable: true },
  {
    key: "quantity",
    label: "Stück",
    sortable: true,
    align: "right",
    render: (row) => formatNumber(row.quantity),
  },
  {
    key: "occurrences",
    label: "Käufe",
    sortable: true,
    align: "right",
    render: (row) => formatNumber(row.occurrences),
  },
  {
    key: "totalSpent",
    label: "Ausgaben",
    sortable: true,
    align: "right",
    render: (row) => formatEuro(row.totalSpent),
  },
];

const repeatColumns: DataTableColumn<RepeatPurchaseEntry>[] = [
  { key: "productName", label: "Produkt", sortable: true },
  {
    key: "count",
    label: "Käufe",
    sortable: true,
    align: "right",
    render: (row) => formatNumber(row.count),
  },
  {
    key: "averageIntervalDays",
    label: "Ø Intervall",
    sortable: true,
    align: "right",
    sortValue: (row) => row.averageIntervalDays ?? 0,
    render: (row) =>
      row.averageIntervalDays === null
        ? "—"
        : `${formatNumber(Math.round(row.averageIntervalDays))} Tage`,
  },
  {
    key: "totalSpent",
    label: "Ausgaben",
    sortable: true,
    align: "right",
    render: (row) => formatEuro(row.totalSpent),
  },
];

export function CategoriesView() {
  const insights = useInsights();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xl)" }}>
      <SectionCard title="Verteilung nach Kategorie">
        <CategoryBreakdownChart data={insights.spendingByCategory} />
      </SectionCard>
      <SectionCard title="Top 20 Artikel" description="Meistgekaufte Produkte">
        <DataTable
          columns={topItemsColumns}
          data={insights.topItems}
          initialSort={{ key: "quantity", direction: "desc" }}
          emptyMessage="Keine Artikel im aktuellen Zeitraum."
        />
      </SectionCard>
      <SectionCard
        title="Wiederkäufe"
        description="Artikel, die du mindestens 3× gekauft hast"
      >
        <DataTable
          columns={repeatColumns}
          data={insights.repeatPurchases}
          initialSort={{ key: "count", direction: "desc" }}
          emptyMessage="Keine wiederkehrenden Käufe im aktuellen Zeitraum."
        />
      </SectionCard>
    </div>
  );
}
