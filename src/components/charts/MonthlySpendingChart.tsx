import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "../shared/EmptyState";
import { formatEuro } from "../../utils/formatters";

export interface MonthlySpendingChartProps {
  data: Map<string, number>;
  height?: number;
}

export function MonthlySpendingChart({ data, height = 320 }: MonthlySpendingChartProps) {
  if (data.size === 0) {
    return <EmptyState message="Keine Daten für den aktuellen Zeitraum." />;
  }
  const rows = [...data.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, value]) => ({ month, value }));

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            stroke="var(--color-text-muted)"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="var(--color-text-muted)"
            fontSize={12}
            tickFormatter={(v: number) => `${Math.round(v)} €`}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface-elevated)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--color-text-primary)",
            }}
            formatter={(value: number) => formatEuro(value)}
            labelStyle={{ color: "var(--color-text-secondary)" }}
          />
          <Bar dataKey="value" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
