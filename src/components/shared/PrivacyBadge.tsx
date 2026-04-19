export function PrivacyBadge() {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-sm)",
        padding: "var(--space-xs) var(--space-md)",
        background: "color-mix(in srgb, var(--color-positive) 10%, transparent)",
        color: "var(--color-positive)",
        border: "1px solid color-mix(in srgb, var(--color-positive) 30%, transparent)",
        borderRadius: "999px",
        fontSize: "var(--font-size-xs)",
        fontWeight: 500,
        letterSpacing: "0.02em",
      }}
    >
      <span aria-hidden="true">🔒</span>
      <span>Alle Daten bleiben lokal</span>
    </div>
  );
}
