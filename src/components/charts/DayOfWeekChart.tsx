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
import { dayOfWeekLabelsDE } from "../../utils/dateUtils";

export interface DayOfWeekChartProps {
  data: number[];
  height?: number;
}

export function DayOfWeekChart({ data, height = 300 }: DayOfWeekChartProps) {
  if (data.length !== 7 || data.every((v) => v === 0)) {
    return <EmptyState message="Keine Daten für den aktuellen Zeitraum." />;
  }

  const rows = data.map((count, idx) => ({
    day: dayOfWeekLabelsDE[idx] ?? "",
    count,
  }));

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
          <XAxis dataKey="day" stroke="var(--color-text-muted)" fontSize={12} />
          <YAxis stroke="var(--color-text-muted)" fontSize={12} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface-elevated)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--color-text-primary)",
            }}
          />
          <Bar dataKey="count" fill="var(--color-chart-3)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
