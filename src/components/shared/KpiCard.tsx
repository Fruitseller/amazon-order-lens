import styles from "./KpiCard.module.css";

export interface KpiCardProps {
  label: string;
  value: string | null | undefined;
  description?: string;
}

const PLACEHOLDER = "—";

export function KpiCard({ label, value, description }: KpiCardProps) {
  const displayValue = value ?? PLACEHOLDER;

  return (
    <div className={styles.card}>
      <div className={styles.label}>{label}</div>
      <div className={styles.valueRow}>
        <span className={styles.value}>{displayValue}</span>
      </div>
      {description && <div className={styles.description}>{description}</div>}
    </div>
  );
}
