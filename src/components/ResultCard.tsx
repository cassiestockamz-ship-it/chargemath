interface ResultCardProps {
  label: string;
  value: string;
  unit: string;
  highlight?: boolean;
  icon?: string;
}

export default function ResultCard({
  label,
  value,
  unit,
  highlight = false,
  icon,
}: ResultCardProps) {
  return (
    <div
      className={`rounded-xl border p-5 transition-shadow hover:shadow-md ${
        highlight
          ? "border-[var(--color-ev-green)]/30 bg-[var(--color-ev-green)]/5"
          : "border-[var(--color-border)] bg-[var(--color-surface)]"
      }`}
    >
      <div className="mb-1 text-sm font-medium text-[var(--color-text-muted)]">
        {icon && <span className="mr-1.5">{icon}</span>}
        {label}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className={`text-3xl font-bold tracking-tight ${
            highlight ? "text-[var(--color-ev-green)]" : "text-[var(--color-text)]"
          }`}
        >
          {value}
        </span>
        <span className="text-sm font-medium text-[var(--color-text-muted)]">
          {unit}
        </span>
      </div>
    </div>
  );
}
