export interface ImportProgressProps {
  progress: number;
  error?: string | null;
}

export function ImportProgress({ progress, error }: ImportProgressProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));

  if (error) {
    return (
      <div
        role="alert"
        style={{
          padding: "var(--space-md)",
          border: "1px solid var(--color-negative)",
          borderRadius: "var(--radius-md)",
          color: "var(--color-negative)",
          backgroundColor: "color-mix(in srgb, var(--color-negative) 10%, transparent)",
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{
          width: "100%",
          height: "8px",
          backgroundColor: "var(--color-surface-elevated)",
          borderRadius: "var(--radius-sm)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${clamped}%`,
            height: "100%",
            backgroundColor: "var(--color-accent)",
            transition: "width var(--transition-base)",
          }}
        />
      </div>
      <div
        style={{
          marginTop: "var(--space-xs)",
          fontSize: "var(--font-size-xs)",
          color: "var(--color-text-muted)",
        }}
      >
        {clamped}% · verarbeitet
      </div>
    </div>
  );
}
