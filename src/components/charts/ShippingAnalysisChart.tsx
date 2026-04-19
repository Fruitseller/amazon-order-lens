import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { OrderItem } from "../../types/order";
import { EmptyState } from "../shared/EmptyState";

export interface ShippingAnalysisChartProps {
  items: readonly OrderItem[];
  height?: number;
}

export function ShippingAnalysisChart({
  items,
  height = 300,
}: ShippingAnalysisChartProps) {
  const rows = useMemo(() => {
    const buckets = new Map<number, number>();
    for (const item of items) {
      if (item.fulfillmentDays === null) continue;
      const days = Math.max(0, Math.min(14, item.fulfillmentDays));
      buckets.set(days, (buckets.get(days) ?? 0) + 1);
    }
    if (buckets.size === 0) return [];
    const maxDay = Math.max(...buckets.keys());
    const out: { days: string; count: number }[] = [];
    for (let d = 0; d <= maxDay; d++) {
      out.push({ days: `${d}`, count: buckets.get(d) ?? 0 });
    }
    return out;
  }, [items]);

  if (rows.length === 0) {
    return <EmptyState message="Keine Daten für den aktuellen Zeitraum." />;
  }

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="days"
            stroke="var(--color-text-muted)"
            fontSize={12}
            label={{
              value: "Tage bis Versand",
              position: "insideBottom",
              offset: -4,
              fill: "var(--color-text-muted)",
              fontSize: 12,
            }}
          />
          <YAxis stroke="var(--color-text-muted)" fontSize={12} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface-elevated)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--color-text-primary)",
            }}
            labelFormatter={(days: string) => `${days} Tage`}
          />
          <Bar dataKey="count" fill="var(--color-chart-5)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
