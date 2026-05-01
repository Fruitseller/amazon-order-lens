import { useMemo } from "react";
import type { OrderItem } from "../../types/order";
import { MS_PER_DAY } from "../../utils/dateUtils";
import { EmptyState } from "../shared/EmptyState";

export interface CalendarHeatmapProps {
  items: readonly OrderItem[];
  year?: number;
}

const CELL = 12;
const GAP = 3;
const TOP = 20;
const LEFT = 28;
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mär",
  "Apr",
  "Mai",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Okt",
  "Nov",
  "Dez",
];
const WEEKDAY_LABELS = ["Mo", "", "Mi", "", "Fr", "", "So"];

function isoWeekday(date: Date): number {
  // 0=Mo, 6=So
  const jsDay = date.getUTCDay();
  return (jsDay + 6) % 7;
}

function toISODate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function countsFor(items: readonly OrderItem[], year: number): Map<string, number> {
  const counts = new Map<string, number>();
  const orderIdsPerDay = new Map<string, Set<string>>();
  for (const item of items) {
    const d = item.orderDate;
    if (d.getUTCFullYear() !== year) continue;
    const key = toISODate(d);
    let set = orderIdsPerDay.get(key);
    if (!set) {
      set = new Set();
      orderIdsPerDay.set(key, set);
    }
    set.add(item.orderId);
  }
  for (const [key, set] of orderIdsPerDay) {
    counts.set(key, set.size);
  }
  return counts;
}

function colorForCount(count: number, max: number): string {
  if (count === 0) return "var(--color-surface-elevated)";
  const ratio = max === 0 ? 0 : count / max;
  if (ratio < 0.25) return "color-mix(in srgb, var(--color-accent) 25%, var(--color-surface))";
  if (ratio < 0.5) return "color-mix(in srgb, var(--color-accent) 50%, var(--color-surface))";
  if (ratio < 0.75) return "color-mix(in srgb, var(--color-accent) 75%, var(--color-surface))";
  return "var(--color-accent)";
}

interface HeatmapLayout {
  cells: { x: number; y: number; date: string; count: number; color: string }[];
  width: number;
  height: number;
}

export function CalendarHeatmap({ items, year }: CalendarHeatmapProps) {
  const resolvedYear = useMemo(() => {
    if (typeof year === "number") return year;
    if (items.length === 0) return null;
    return Math.max(...items.map((i) => i.orderDate.getUTCFullYear()));
  }, [items, year]);

  const layout = useMemo<HeatmapLayout | null>(() => {
    if (resolvedYear === null) return null;
    const counts = countsFor(items, resolvedYear);
    let maxCount = 0;
    for (const c of counts.values()) if (c > maxCount) maxCount = c;

    const first = new Date(Date.UTC(resolvedYear, 0, 1));
    const cellsList: HeatmapLayout["cells"] = [];
    const startWeekday = isoWeekday(first);
    let day = new Date(first);
    while (day.getUTCFullYear() === resolvedYear) {
      const weekday = isoWeekday(day);
      const dayOfYear = Math.floor((day.getTime() - first.getTime()) / MS_PER_DAY);
      const weekIndex = Math.floor((dayOfYear + startWeekday) / 7);
      const x = LEFT + weekIndex * (CELL + GAP);
      const y = TOP + weekday * (CELL + GAP);
      const key = toISODate(day);
      const count = counts.get(key) ?? 0;
      cellsList.push({ x, y, date: key, count, color: colorForCount(count, maxCount) });
      day = new Date(day.getTime() + MS_PER_DAY);
    }
    const lastWeekIndex = Math.floor((cellsList.length - 1 + startWeekday) / 7);
    return {
      cells: cellsList,
      width: LEFT + (lastWeekIndex + 1) * (CELL + GAP),
      height: TOP + 7 * (CELL + GAP),
    };
  }, [items, resolvedYear]);

  if (resolvedYear === null || layout === null) {
    return <EmptyState message="Keine Daten für den aktuellen Zeitraum." />;
  }

  const { cells, width, height } = layout;
  const first = new Date(Date.UTC(resolvedYear, 0, 1));
  const startWeekday = isoWeekday(first);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Bestelldichte Heatmap für ${resolvedYear}`}
    >
      {WEEKDAY_LABELS.map((label, idx) => (
        <text
          key={idx}
          x={LEFT - 6}
          y={TOP + idx * (CELL + GAP) + CELL - 2}
          textAnchor="end"
          fontSize={10}
          fill="var(--color-text-muted)"
        >
          {label}
        </text>
      ))}
      {MONTH_LABELS.map((label, idx) => {
        const firstOfMonth = new Date(Date.UTC(resolvedYear, idx, 1));
        const dayOfYear = Math.floor(
          (firstOfMonth.getTime() - first.getTime()) / MS_PER_DAY,
        );
        const weekIndex = Math.floor((dayOfYear + startWeekday) / 7);
        return (
          <text
            key={idx}
            x={LEFT + weekIndex * (CELL + GAP)}
            y={TOP - 6}
            fontSize={10}
            fill="var(--color-text-muted)"
          >
            {label}
          </text>
        );
      })}
      {cells.map((cell) => (
        <rect
          key={cell.date}
          x={cell.x}
          y={cell.y}
          width={CELL}
          height={CELL}
          fill={cell.color}
          rx={2}
          data-date={cell.date}
          data-count={cell.count}
          aria-label={`${cell.date}: ${cell.count} ${cell.count === 1 ? "Bestellung" : "Bestellungen"}`}
        >
          <title>{`${cell.date}: ${cell.count} Bestellungen`}</title>
        </rect>
      ))}
    </svg>
  );
}
