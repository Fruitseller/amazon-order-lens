import { useMemo, useState, type ReactNode } from "react";
import { EmptyState } from "./EmptyState";
import styles from "./DataTable.module.css";

export interface DataTableColumn<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  align?: "left" | "right";
}

export type SortDirection = "asc" | "desc";

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: readonly T[];
  emptyMessage?: string;
  initialSort?: { key: string; direction: SortDirection };
}

function defaultSortValue<T>(row: T, key: string): string | number {
  const raw = (row as Record<string, unknown>)[key];
  if (typeof raw === "number" || typeof raw === "string") return raw;
  if (raw instanceof Date) return raw.getTime();
  return String(raw ?? "");
}

function defaultRender<T>(row: T, key: string): ReactNode {
  const raw = (row as Record<string, unknown>)[key];
  if (raw === null || raw === undefined) return "";
  if (raw instanceof Date) return raw.toISOString();
  return String(raw);
}

export function DataTable<T>({
  columns,
  data,
  emptyMessage = "Keine Daten verfügbar.",
  initialSort,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{ key: string; direction: SortDirection } | null>(
    initialSort ?? null,
  );

  const sorted = useMemo(() => {
    if (!sort) return [...data];
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return [...data];
    const getValue = col.sortValue ?? ((row: T) => defaultSortValue(row, col.key));
    const dir = sort.direction === "asc" ? 1 : -1;
    return [...data].sort((a, b) => {
      const av = getValue(a);
      const bv = getValue(b);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }, [data, sort, columns]);

  if (data.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  const onHeaderClick = (col: DataTableColumn<T>) => {
    if (!col.sortable) return;
    setSort((prev) => {
      if (prev?.key !== col.key) return { key: col.key, direction: "asc" };
      return {
        key: col.key,
        direction: prev.direction === "asc" ? "desc" : "asc",
      };
    });
  };

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => {
              const isActive = sort?.key === col.key;
              const classes = [
                styles.th,
                col.sortable ? styles.thSortable : "",
                col.align === "right" ? styles.right : "",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <th
                  key={col.key}
                  className={classes}
                  scope="col"
                  onClick={() => onHeaderClick(col)}
                  aria-sort={
                    isActive
                      ? sort?.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  {col.label}
                  {isActive && (
                    <span className={styles.sortIndicator} aria-hidden="true">
                      {sort?.direction === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr key={i} className={styles.tr}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={[styles.td, col.align === "right" ? styles.right : ""]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {col.render ? col.render(row) : defaultRender(row, col.key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
