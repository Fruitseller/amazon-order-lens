import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { OrderItem } from "../../types/order";
import { EmptyState } from "../shared/EmptyState";
import { formatEuro } from "../../utils/formatters";

export interface CumulativeSpendingChartProps {
  items: readonly OrderItem[];
  height?: number;
}

export function CumulativeSpendingChart({
  items,
  height = 360,
}: CumulativeSpendingChartProps) {
  const rows = useMemo(() => {
    if (items.length === 0) return [];
    const sorted = [...items].sort(
      (a, b) => a.orderDate.getTime() - b.orderDate.getTime(),
    );
    let cumulative = 0;
    const out: { date: string; cumulative: number }[] = [];
    for (const item of sorted) {
      cumulative += item.totalOwed;
      out.push({
        date: item.orderDate.toISOString().slice(0, 10),
        cumulative,
      });
    }
    return out;
  }, [items]);

  if (rows.length === 0) {
    return <EmptyState message="Keine Daten für den aktuellen Zeitraum." />;
  }

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <defs>
            <linearGradient id="cumArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.5} />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            stroke="var(--color-text-muted)"
            fontSize={12}
            minTickGap={40}
          />
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
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke="var(--color-accent)"
            fill="url(#cumArea)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
