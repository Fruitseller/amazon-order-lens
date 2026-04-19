export interface EmptyStateProps {
  title?: string;
  message: string;
}

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div
      role="status"
      style={{
        padding: "var(--space-xl)",
        textAlign: "center",
        color: "var(--color-text-muted)",
        borderRadius: "var(--radius-md)",
        border: "1px dashed var(--color-border)",
        backgroundColor: "var(--color-surface)",
      }}
    >
      {title && (
        <div
          style={{
            fontSize: "var(--font-size-lg)",
            fontWeight: 600,
            color: "var(--color-text-secondary)",
            marginBottom: "var(--space-xs)",
          }}
        >
          {title}
        </div>
      )}
      <div>{message}</div>
    </div>
  );
}
