import { useInsights } from "../../hooks/useInsights";
import { KpiCard } from "../shared/KpiCard";
import { SectionCard } from "../shared/SectionCard";
import { CumulativeSpendingChart } from "../charts/CumulativeSpendingChart";
import { useFilteredData } from "../../hooks/useFilteredData";
import { formatDate, formatEuro, formatNumber } from "../../utils/formatters";

function formatMembershipDuration(from: Date | null): string | null {
  if (!from) return null;
  const now = new Date();
  let years = now.getUTCFullYear() - from.getUTCFullYear();
  let months = now.getUTCMonth() - from.getUTCMonth();
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years <= 0 && months <= 0) return "weniger als einen Monat";
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "Jahr" : "Jahre"}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? "Monat" : "Monate"}`);
  return parts.join(", ");
}

export function OverviewView() {
  const insights = useInsights();
  const { items } = useFilteredData();

  const membership = formatMembershipDuration(insights.firstOrderDate);

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
          description={
            insights.totalSavings > 0
              ? `inkl. ${formatEuro(insights.totalSavings)} Rabatte`
              : undefined
          }
        />
        <KpiCard
          label="Bestellungen"
          value={insights.orderCount > 0 ? formatNumber(insights.orderCount) : null}
        />
        <KpiCard
          label="Artikel"
          value={insights.itemCount > 0 ? formatNumber(insights.itemCount) : null}
        />
        <KpiCard
          label="Ø Bestellwert"
          value={insights.averageOrderValue > 0 ? formatEuro(insights.averageOrderValue) : null}
        />
        <KpiCard
          label="Amazon-Kunde"
          value={membership}
          description={
            insights.firstOrderDate
              ? `seit ${formatDate(insights.firstOrderDate)}`
              : undefined
          }
        />
        <KpiCard
          label="Ø pro Tag"
          value={
            insights.spendingPerDay !== null
              ? formatEuro(insights.spendingPerDay)
              : null
          }
          description={
            insights.daysActive !== null
              ? `über ${formatNumber(insights.daysActive)} Tage`
              : undefined
          }
        />
      </div>
      <SectionCard
        title="Kumulative Ausgaben"
        description="Wie deine Amazon-Ausgaben über die Jahre gewachsen sind."
      >
        <CumulativeSpendingChart items={items} />
      </SectionCard>
    </div>
  );
}
