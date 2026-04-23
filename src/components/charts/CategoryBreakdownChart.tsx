import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { ProductCategory } from "../../types/order";
import { EmptyState } from "../shared/EmptyState";
import { formatEuro } from "../../utils/formatters";
import { CATEGORY_LABELS_DE, CATEGORY_ORDER, CHART_COLORS } from "../../utils/constants";

export interface CategoryBreakdownChartProps {
  data: Map<ProductCategory, number>;
  height?: number;
}

export function CategoryBreakdownChart({ data, height = 360 }: CategoryBreakdownChartProps) {
  if (data.size === 0) {
    return <EmptyState message="Keine Daten für den aktuellen Zeitraum." />;
  }
  const rows = CATEGORY_ORDER.filter((cat) => (data.get(cat) ?? 0) > 0).map((cat, idx) => ({
    name: CATEGORY_LABELS_DE[cat],
    value: data.get(cat) ?? 0,
    color: CHART_COLORS[idx % CHART_COLORS.length] ?? "var(--color-chart-1)",
  }));

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
            formatter={(value: number) => formatEuro(value)}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
