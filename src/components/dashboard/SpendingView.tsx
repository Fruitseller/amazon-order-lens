import { useMemo } from "react";
import { useInsights } from "../../hooks/useInsights";
import { useFilteredData } from "../../hooks/useFilteredData";
import { SectionCard } from "../shared/SectionCard";
import { KpiCard } from "../shared/KpiCard";
import { MonthlySpendingChart } from "../charts/MonthlySpendingChart";
import { YearlyComparisonChart } from "../charts/YearlyComparisonChart";
import { DataTable, type DataTableColumn } from "../shared/DataTable";
import { formatDate, formatEuro } from "../../utils/formatters";
import type { OrderItem } from "../../types/order";

const topColumns: DataTableColumn<OrderItem>[] = [
  { key: "productName", label: "Produkt", sortable: true },
  {
    key: "orderDate",
    label: "Datum",
    sortable: true,
    sortValue: (row) => row.orderDate.getTime(),
    render: (row) => formatDate(row.orderDate),
  },
  {
    key: "totalOwed",
    label: "Preis",
    sortable: true,
    align: "right",
    render: (row) => formatEuro(row.totalOwed),
  },
];

export function SpendingView() {
  const insights = useInsights();
  const { items } = useFilteredData();

  const topItems = useMemo(
    () => [...items].sort((a, b) => b.totalOwed - a.totalOwed).slice(0, 20),
    [items],
  );

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
          label="Gesamtausgaben"
          value={insights.totalSpending > 0 ? formatEuro(insights.totalSpending) : null}
        />
        <KpiCard
          label="Rabatte / Ersparnisse"
          value={insights.totalSavings > 0 ? formatEuro(insights.totalSavings) : null}
        />
        <KpiCard
          label="Prime-Versand gespart"
          value={
            insights.primeSavingsEstimate > 0
              ? formatEuro(insights.primeSavingsEstimate)
              : null
          }
          description="geschätzt bei 3,99 € Standardversand"
        />
      </div>
      <SectionCard title="Monatliche Ausgaben">
        <MonthlySpendingChart data={insights.spendingByMonth} />
      </SectionCard>
      <SectionCard title="Jährliche Ausgaben">
        <YearlyComparisonChart data={insights.spendingByYear} />
      </SectionCard>
      <SectionCard title="Top 20 teuerste Käufe">
        <DataTable
          columns={topColumns}
          data={topItems}
          initialSort={{ key: "totalOwed", direction: "desc" }}
          emptyMessage="Keine Bestellungen im aktuellen Zeitraum."
        />
      </SectionCard>
    </div>
  );
}
