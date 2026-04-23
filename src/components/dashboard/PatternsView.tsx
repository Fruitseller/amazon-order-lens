import { useMemo } from "react";
import { useInsights } from "../../hooks/useInsights";
import { useFilteredData } from "../../hooks/useFilteredData";
import { SectionCard } from "../shared/SectionCard";
import { KpiCard } from "../shared/KpiCard";
import { DayOfWeekChart } from "../charts/DayOfWeekChart";
import { HourOfDayChart } from "../charts/HourOfDayChart";
import { CalendarHeatmap } from "../charts/CalendarHeatmap";
import { ShippingAnalysisChart } from "../charts/ShippingAnalysisChart";
import { formatEuro, formatMonthKey, formatNumber, formatWeekKey } from "../../utils/formatters";

export function PatternsView() {
  const insights = useInsights();
  const { items } = useFilteredData();

  const years = useMemo(() => {
    const set = new Set<number>();
    for (const item of items) set.add(item.orderDate.getUTCFullYear());
    return [...set].sort((a, b) => b - a);
  }, [items]);

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
          label="Ø Versandzeit"
          value={
            insights.fulfillmentSpeedDays !== null
              ? `${insights.fulfillmentSpeedDays.toFixed(1)} Tage`
              : null
          }
        />
        <KpiCard
          label="Längste Pause"
          value={
            insights.longestGap
              ? `${formatNumber(Math.round(insights.longestGap.days))} Tage`
              : null
          }
        />
        <KpiCard
          label="Aktivster Tag"
          value={insights.busiestDay?.date ?? null}
          description={
            insights.busiestDay ? `${insights.busiestDay.count} Bestellungen` : undefined
          }
        />
        <KpiCard
          label="Rekordmonat"
          value={insights.recordMonth ? formatMonthKey(insights.recordMonth.key) : null}
          description={
            insights.recordMonth
              ? `${formatEuro(insights.recordMonth.spending)} · ${formatNumber(insights.recordMonth.orderCount)} Bestellungen`
              : undefined
          }
        />
        <KpiCard
          label="Rekordwoche"
          value={insights.recordWeek ? formatWeekKey(insights.recordWeek.key) : null}
          description={
            insights.recordWeek
              ? `${formatEuro(insights.recordWeek.spending)} · ${formatNumber(insights.recordWeek.orderCount)} Bestellungen`
              : undefined
          }
        />
      </div>
      <SectionCard title="Verteilung nach Wochentag">
        <DayOfWeekChart data={insights.dayOfWeekDistribution} />
      </SectionCard>
      <SectionCard title="Verteilung nach Uhrzeit (Europe/Berlin)">
        <HourOfDayChart data={insights.hourDistribution} />
      </SectionCard>
      <SectionCard title="Kalender-Heatmap" description="Bestelldichte pro Tag">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          {years.length === 0 ? (
            <CalendarHeatmap items={[]} />
          ) : (
            years.slice(0, 5).map((year) => (
              <div key={year}>
                <div
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-text-secondary)",
                    marginBottom: "var(--space-xs)",
                  }}
                >
                  {year}
                </div>
                <CalendarHeatmap items={items} year={year} />
              </div>
            ))
          )}
        </div>
      </SectionCard>
      <SectionCard title="Versandgeschwindigkeit" description="Tage von Bestellung bis Versand">
        <ShippingAnalysisChart items={items} />
      </SectionCard>
    </div>
  );
}
