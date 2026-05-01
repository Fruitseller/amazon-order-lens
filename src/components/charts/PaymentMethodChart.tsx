import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { EmptyState } from "../shared/EmptyState";
import { CHART_COLORS } from "../../utils/constants";

export interface PaymentMethodChartProps {
  data: Map<string, number>;
  height?: number;
}

export function PaymentMethodChart({ data, height = 300 }: PaymentMethodChartProps) {
  const rows = useMemo(
    () =>
      [...data.entries()]
        .sort(([, a], [, b]) => b - a)
        .map(([name, value], idx) => ({
          name,
          value,
          color: CHART_COLORS[idx % CHART_COLORS.length] ?? "var(--color-chart-1)",
        })),
    [data],
  );

  if (data.size === 0) {
    return <EmptyState message="Keine Daten für den aktuellen Zeitraum." />;
  }

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 0, height }}>
        <PieChart>
          <Pie
            data={rows}
            dataKey="value"
            nameKey="name"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={2}
          >
            {rows.map((row) => (
              <Cell key={row.name} fill={row.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface-elevated)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--color-text-primary)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
