import { useMemo } from "react";
import { useInsights } from "../../hooks/useInsights";
import { useFilteredData } from "../../hooks/useFilteredData";
import { SectionCard } from "../shared/SectionCard";
import { KpiCard } from "../shared/KpiCard";
import { DataTable, type DataTableColumn } from "../shared/DataTable";
import { PaymentMethodChart } from "../charts/PaymentMethodChart";
import type { ShoppingEventEntry } from "../../services/statistics";
import {
  INVESTMENT_ANNUAL_RATE,
  PACKAGE_CO2_KG,
} from "../../utils/constants";
import { formatDate, formatEuro, formatNumber } from "../../utils/formatters";

const eventColumns: DataTableColumn<ShoppingEventEntry>[] = [
  { key: "event", label: "Event", sortable: true },
  {
    key: "totalSpending",
    label: "Ausgaben",
    align: "right",
    sortable: true,
    sortValue: (row) => row.totalSpending,
    render: (row) => formatEuro(row.totalSpending),
  },
  {
    key: "orderCount",
    label: "Bestellungen",
    align: "right",
    sortable: true,
    sortValue: (row) => row.orderCount,
    render: (row) => formatNumber(row.orderCount),
  },
  {
    key: "itemCount",
    label: "Artikel",
    align: "right",
    sortable: true,
    sortValue: (row) => row.itemCount,
    render: (row) => formatNumber(row.itemCount),
  },
];

export function FunFactsView() {
  const insights = useInsights();
  const { items } = useFilteredData();

  const firstOrderItem = useMemo(() => {
    if (items.length === 0) return null;
    return [...items].sort(
      (a, b) => a.orderDate.getTime() - b.orderDate.getTime(),
    )[0];
  }, [items]);

  const investmentLabel = `Hätte ich bei ${formatNumber(INVESTMENT_ANNUAL_RATE * 100, 0)} % p.a. investiert`;
  const packagesCO2 = insights.orderCount * PACKAGE_CO2_KG;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xl)" }}>
      <SectionCard
        title={investmentLabel}
        description="Kumulierte Opportunitätskosten deiner Einkäufe"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--font-size-3xl)",
              color: "var(--color-positive)",
            }}
          >
            {formatEuro(insights.investmentOpportunityCost)}
          </div>
          <div style={{ color: "var(--color-text-secondary)" }}>
            Wäre aus deinen {formatNumber(insights.orderCount)} Bestellungen in Summe
            geworden — bei konsequenter Anlage statt Konsum.
          </div>
        </div>
      </SectionCard>

      <div
        style={{
          display: "grid",
          gap: "var(--space-md)",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <KpiCard
          label="Pakete"
          value={formatNumber(insights.orderCount)}
          description={`~${formatNumber(packagesCO2, 0)} kg CO₂ geschätzt`}
        />
        <KpiCard
          label="Geschenke"
          value={
            insights.giftCount > 0
              ? `${formatNumber(insights.giftCount)} Bestellungen`
              : null
          }
        />
        <KpiCard
          label="Prime-Ersparnis"
          value={
            insights.primeSavingsEstimate > 0
              ? formatEuro(insights.primeSavingsEstimate)
              : null
          }
          description="geschätzt bei 3,99 € Standardversand"
        />
        <KpiCard
          label="Längste Pause"
          value={
            insights.longestGap
              ? `${formatNumber(Math.round(insights.longestGap.days))} Tage`
              : null
          }
          description={
            insights.longestGap
              ? `${formatDate(insights.longestGap.from)} → ${formatDate(insights.longestGap.to)}`
              : undefined
          }
        />
        <KpiCard
          label="Shopping-Marathon"
          value={insights.busiestDay?.date ?? null}
          description={
            insights.busiestDay
              ? `${insights.busiestDay.count} Bestellungen an diesem Tag`
              : undefined
          }
        />
      </div>

      <SectionCard title="Erste Bestellung">
        {firstOrderItem ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
            <div
              style={{
                fontSize: "var(--font-size-xl)",
                color: "var(--color-text-primary)",
              }}
            >
              {firstOrderItem.productName}
            </div>
            <div style={{ color: "var(--color-text-secondary)" }}>
              {formatDate(firstOrderItem.orderDate)} · {formatEuro(firstOrderItem.totalOwed)}
            </div>
          </div>
        ) : (
          <div style={{ color: "var(--color-text-muted)" }}>—</div>
        )}
      </SectionCard>

      <SectionCard
        title="Shopping-Events"
        description="Bestellungen während Black Friday, Cyber Monday, Prime Day und Adventszeit (1.–24. Dez.)"
      >
        <DataTable
          columns={eventColumns}
          data={insights.shoppingEventStats}
          initialSort={{ key: "totalSpending", direction: "desc" }}
        />
      </SectionCard>

      <SectionCard title="Zahlungsmethoden">
        <PaymentMethodChart data={insights.paymentMethodDistribution} />
      </SectionCard>
    </div>
  );
}
