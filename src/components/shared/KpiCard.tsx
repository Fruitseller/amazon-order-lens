import { formatPercent } from "../../utils/formatters";
import styles from "./KpiCard.module.css";

export interface KpiCardProps {
  label: string;
  value: string | null | undefined;
  description?: string;
  trend?: number;
}

const PLACEHOLDER = "—";

export function KpiCard({ label, value, description, trend }: KpiCardProps) {
  const displayValue = value ?? PLACEHOLDER;
  const hasTrend = typeof trend === "number" && Number.isFinite(trend);
  const isUp = hasTrend && trend > 0;
  const isDown = hasTrend && trend < 0;

  return (
    <div className={styles.card}>
      <div className={styles.label}>{label}</div>
      <div className={styles.valueRow}>
        <span className={styles.value}>{displayValue}</span>
        {hasTrend && (
          <span
            className={[
              styles.trend,
              isUp ? styles.trendUp : "",
              isDown ? styles.trendDown : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-label={isUp ? "Trend steigend" : "Trend fallend"}
          >
            <span aria-hidden="true">{isUp ? "↑" : "↓"}</span>
            <span>{formatPercent(Math.abs(trend))}</span>
          </span>
        )}
      </div>
      {description && <div className={styles.description}>{description}</div>}
    </div>
  );
}
