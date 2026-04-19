import type { ChangeEvent } from "react";
import type { DateRange } from "../../types/state";

export interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

function toInputValue(date: Date | null): string {
  if (!date) return "";
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function fromInputValue(raw: string): Date | null {
  if (!raw) return null;
  const d = new Date(`${raw}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const handleFrom = (e: ChangeEvent<HTMLInputElement>) => {
    onChange({ from: fromInputValue(e.target.value), to: value.to });
  };
  const handleTo = (e: ChangeEvent<HTMLInputElement>) => {
    onChange({ from: value.from, to: fromInputValue(e.target.value) });
  };
  const handleReset = () => onChange({ from: null, to: null });

  return (
    <div
      style={{
        display: "flex",
        gap: "var(--space-md)",
        alignItems: "flex-end",
        flexWrap: "wrap",
      }}
    >
      <label
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-xs)",
          color: "var(--color-text-secondary)",
          fontSize: "var(--font-size-xs)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        Von
        <input
          type="date"
          value={toInputValue(value.from)}
          onChange={handleFrom}
          style={inputStyle}
        />
      </label>
      <label
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-xs)",
          color: "var(--color-text-secondary)",
          fontSize: "var(--font-size-xs)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        Bis
        <input
          type="date"
          value={toInputValue(value.to)}
          onChange={handleTo}
          style={inputStyle}
        />
      </label>
      <button type="button" onClick={handleReset} style={resetBtn}>
        Zurücksetzen
      </button>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "var(--color-surface)",
  color: "var(--color-text-primary)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-sm)",
  padding: "var(--space-sm) var(--space-md)",
  fontFamily: "var(--font-sans)",
  fontSize: "var(--font-size-sm)",
  colorScheme: "dark",
};

const resetBtn: React.CSSProperties = {
  background: "transparent",
  color: "var(--color-text-secondary)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-sm)",
  padding: "var(--space-sm) var(--space-md)",
  cursor: "pointer",
  fontSize: "var(--font-size-sm)",
};
