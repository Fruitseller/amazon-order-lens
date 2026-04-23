import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EmptyState } from "../shared/EmptyState";
import { formatEuro } from "../../utils/formatters";

export interface YearlyComparisonChartProps {
  data: Map<number, number>;
  height?: number;
}

export function YearlyComparisonChart({ data, height = 320 }: YearlyComparisonChartProps) {
  if (data.size === 0) {
    return <EmptyState message="Keine Daten für den aktuellen Zeitraum." />;
  }
  const rows = [...data.entries()]
    .sort(([a], [b]) => a - b)
    .map(([year, value]) => ({ year: String(year), value }));

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 0, height }}>
        <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
          <XAxis dataKey="year" stroke="var(--color-text-muted)" fontSize={12} />
          <YAxis
            stroke="var(--color-text-muted)"
            fontSize={12}
            tickFormatter={(v: number) => `${Math.round(v)} €`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface-elevated)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--color-text-primary)",
            }}
            formatter={(value: number) => formatEuro(value)}
          />
          <Bar dataKey="value" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
